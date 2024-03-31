"use strict";
const express = require('express');
const https = require('http');
const fs = require('fs');
const bodyparser = require("body-parser");
const mongoSanitize = require("express-mongo-sanitize")
const connectDB = require('./server/database/connection');
const app = express();
const port = 3112;
const cors = require('cors');

// CORS configuration
app.use(cors({
  "Access-Control-Allow-Headers" : "*",
}));
// MongoDB connection
connectDB();

// Express middleware for sanitizing MongoDB queries
app.use(
  mongoSanitize({
    replaceWith: '_',
  })
);
// Body-parser middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// Define a route
app.use('/', require('./server/routes/router'));

// HTTPS Configuration
// const httpsOptions = {
//   key: fs.readFileSync('/home/admin/web/homeronsol.com/ssl/ssl.homeronsol.com.key'),
//   cert: fs.readFileSync('/home/admin/web/homeronsol.com/ssl/ssl.homeronsol.com.pem'),
// };
// // Start the HTTPS server
// const server = https.createServer(httpsOptions, app);

// server.listen(port, () => {
//   console.log(`Server running on port ${port} (HTTPS)`);
// });

app.listen(port, () => {
  console.log(`Server running on port ${port} (HTTPS)`);
});
