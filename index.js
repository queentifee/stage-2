process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require("express");
const countryRoutes = require("./routes/countryRoutes");
require("dotenv").config();

const app = express();
app.use(express.json());



app.use("/", countryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
