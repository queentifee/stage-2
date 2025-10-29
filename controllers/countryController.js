const axios = require("axios");
const pool = require("../config/db");
const fs = require("fs");
const path = require("path");
const  {generateSummaryImage} = require ('../utils/generateImage');


exports.refreshCountries = async (req, res) => {
  try {
    const countriesUrl =
      "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";
    const ratesUrl = "https://open.er-api.com/v6/latest/USD";

    // Fetch both APIs concurrently
    const [countriesRes, ratesRes] = await Promise.all([
      axios.get(countriesUrl),
      axios.get(ratesUrl),
    ]);

    const countries = countriesRes.data;
    const rates = ratesRes.data.rates; 
    const now = new Date();

    const connection = await pool.getConnection();
    await connection.beginTransaction();

   for (const country of countries) {
  const currency_code = country.currencies?.[0]?.code || null;
  const exchange_rate = currency_code ? rates[currency_code] || null : null;

  let estimated_gdp = null;
  if (!currency_code) estimated_gdp = 0;
  else if (!exchange_rate) estimated_gdp = null;
  else {
    const randomFactor = Math.floor(Math.random() * 1001) + 1000;
    estimated_gdp = (country.population * randomFactor) / exchange_rate;
  }

      if (!country.name || !country.population) {
  console.warn(`Skipping invalid country: missing name or population`);
  continue;
}

      const values = [
        country.name,
        country.name.toLowerCase(),
        country.capital || null,
        country.region || null,
        country.population,
        currency_code,
        exchange_rate,
        estimated_gdp,
        country.flag || null,
        now,
      ];

      await connection.query(
        `
        INSERT INTO countries
        (name, name_normalized, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          capital = VALUES(capital),
          region = VALUES(region),
          population = VALUES(population),
          currency_code = VALUES(currency_code),
          exchange_rate = VALUES(exchange_rate),
          estimated_gdp = VALUES(estimated_gdp),
          flag_url = VALUES(flag_url),
          last_refreshed_at = VALUES(last_refreshed_at)
      `,
        values
      );
    }

    await connection.commit();
    connection.release();

    await generateSummaryImage();

    res.json({
      message: "Countries refreshed successfully",
      last_refreshed_at: now,
    });
  } catch (error) {
    console.error("Error refreshing countries:", error);

    res.status(503).json({
      error: "External data source unavailable",
      details: error.message,
    });
  }
};


const badRequest = (res, details) => res.status(400).json({ error: "Validation failed", details });
const notFound = (res) => res.status(404).json({ error: "Country not found" });
const internalErr = (res) => res.status(500).json({ error: "Internal server error" });

exports.getCountries = async (req, res) => {
  try {
    const { region, currency, sort } = req.query;

    if (region && typeof region !== "string") return badRequest(res, { region: "must be a string" });
    if (currency && typeof currency !== "string") return badRequest(res, { currency: "must be a string" });
    if (sort && !["gdp_desc", "gdp_asc"].includes(sort)) return badRequest(res, { sort: "invalid value" });

    let sql = `SELECT id, name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, 
                       DATE_FORMAT(last_refreshed_at, '%Y-%m-%dT%TZ') AS last_refreshed_at
                FROM countries WHERE 1=1`;
    const params = [];

    if (region) {
      sql += " AND region = ?";
      params.push(region);
    }
    if (currency) {
      sql += " AND currency_code = ?";
      params.push(currency);
    }

    if (sort === "gdp_desc") sql += " ORDER BY estimated_gdp DESC";
    else if (sort === "gdp_asc") sql += " ORDER BY estimated_gdp ASC";
    else sql += " ORDER BY name ASC";

    const [rows] = await pool.execute(sql, params);
    return res.status(200).json(rows);
  } catch (err) {
    console.error("getCountries error:", err);
    return internalErr(res);
  }
};

// GET /countries/:name
exports.getCountryByName = async (req, res) => {
  try {
    const { name } = req.params;
    if (!name || !name.trim()) return badRequest(res, { name: "is required" });

    const sql = `SELECT id, name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url,
                        DATE_FORMAT(last_refreshed_at, '%Y-%m-%dT%TZ') AS last_refreshed_at
                 FROM countries WHERE name_normalized = LOWER(?) LIMIT 1`;
    const [rows] = await pool.execute(sql, [name]);
    if (!rows || rows.length === 0) return notFound(res);

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error("getCountryByName error:", err);
    return internalErr(res);
  }
};

// DELETE /countries/:name
exports.deleteCountryByName = async (req, res) => {
  try {
    const { name } = req.params;
    if (!name || !name.trim()) return badRequest(res, { name: "is required" });

    const sql = `DELETE FROM countries WHERE name_normalized = LOWER(?)`;
    const [result] = await pool.execute(sql, [name]);

    if (result.affectedRows === 0) return notFound(res);

    return res.status(204).send();
  } catch (err) {
    console.error("deleteCountryByName error:", err);
    return internalErr(res);
  }
};

// GET /status
exports.getStatus = async (req, res) => {
  try {
    const [[countRow]] = await pool.query("SELECT COUNT(*) AS total FROM countries");
    const [[tsRow]] = await pool.query("SELECT MAX(last_refreshed_at) AS last_refreshed_at FROM countries");

    return res.status(200).json({
      total_countries: countRow.total || 0,
      last_refreshed_at: tsRow.last_refreshed_at ? new Date(tsRow.last_refreshed_at).toISOString() : null,
    });
  } catch (err) {
    console.error("getStatus error:", err);
    return internalErr(res);
  }
};

// GET /countries/image
exports.getSummaryImage = (req, res) => {
  try {
    const imagePath = path.join(process.cwd(), "cache", "summary.png");
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "Summary image not found" });
    }
    return res.sendFile(imagePath);
  } catch (err) {
    console.error("getSummaryImage error:", err);
    return internalErr(res);
  }
};