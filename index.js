process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require("express");
const countryRoutes = require("./routes/countryRoutes");


const app = express();
app.use(express.json());
require ("dotenv").config();


app.use("/", countryRoutes);

app.listen(process.env.PORT, () =>
  console.log("Server running...")
);