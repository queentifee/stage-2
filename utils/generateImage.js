const pool = require("../config/db");
const fs = require("fs");
const path = require("path");
const { createCanvas } = require ("canvas");

exports.generateSummaryImage = async () => {
  const [countries] = await pool.query(
    "SELECT name, estimated_gdp FROM countries ORDER BY estimated_gdp DESC LIMIT 5"
  );

  const [countResult] = await pool.query(
    "SELECT COUNT(*) as total FROM countries"
  );

  const totalCountries = countResult[0].total;
  const lastRefreshed = new Date().toISOString();

  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#f4f4f4";
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = "#222";
  ctx.font = "bold 28px Arial";
  ctx.fillText("🌍 Country Summary", 50, 60);

  // Stats
  ctx.font = "20px Arial";
  ctx.fillText(`Total Countries: ${totalCountries}`, 50, 120);
  ctx.fillText(`Last Refreshed: ${lastRefreshed}`, 50, 150);

  // Top 5 GDP
  ctx.fillText("Top 5 Countries by Estimated GDP:", 50, 200);
  countries.forEach((c, i) => {
  const gdp = parseFloat(c.estimated_gdp);
  const displayGDP = isNaN(gdp) ? "N/A" : gdp.toFixed(2);
  ctx.fillText(`${i + 1}. ${c.name} - ${displayGDP}`, 80, 240 + i * 40);
});

  const cacheDir = path.join(process.cwd(), "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const out = fs.createWriteStream(path.join(cacheDir, "summary.png"));
  const stream = canvas.createPNGStream();
  stream.pipe(out);

  out.on("finish", () =>
    console.log("✅ Summary image generated: cache/summary.png")
  );
};
