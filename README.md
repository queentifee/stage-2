Countries API

A simple Node.js + Express + MySQL service that fetches and stores country data with currency, exchange rate, and estimated GDP. It also generates a summary image.

Project Structure
/config/db.js        → MySQL connection pool  
/controllers/        → Route handlers (refresh, image, etc.)  
/routes/             → Express route definitions  
/cache/              → Stores generated summary.png  
server.js            → Entry point  

Setup

1. Clone & Install

git clone https://github.com/queentifee/stage-2.git
cd countries-api
npm install


2.  Create .env

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=countries_db
PORT=3000


3.  Setup Database

CREATE DATABASE countries_db;
USE countries_db;

CREATE TABLE countries (
  name VARCHAR(255) PRIMARY KEY,
  capital VARCHAR(255),
  region VARCHAR(100),
  population BIGINT,
  currency_code VARCHAR(10),
  exchange_rate DECIMAL(15,6),
  estimated_gdp DECIMAL(20,2),
  flag_url TEXT,
  last_refreshed_at DATETIME
);


4.  Run

npm run dev

 Endpoints
Method	Endpoint	Description
GET	/countries	List countries (supports filters)
GET	/countries/:name	Get a single country
GET	/countries/image	Summary image
GET	/status	
POST	/countries/refresh	Refresh data from APIs

Dependencies

express, axios, mysql2, dotenv, canvas, fs, path

Example
GET /countries?region=Africa

[
  {
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  }
]