const express = require("express");
const router = express.Router();
const { refreshCountries, getCountries, getCountryByName, getStatus, deleteCountryByName, getSummaryImage } = require("../controllers/countryController");

router.post("/countries/refresh", refreshCountries);
router.get("/countries/image", getSummaryImage);
router.get("/countries", getCountries); 
router.get("/countries/:name", getCountryByName);
router.delete("/countries/:name", deleteCountryByName);

router.get("/status", getStatus);


module.exports = router;
