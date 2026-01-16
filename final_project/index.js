const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session setup for /customer routes
app.use(
    "/customer",
    session({
        secret: "fingerprint_customer",
        resave: true,
        saveUninitialized: true,
        cookie: { secure: false } // set to true if using HTTPS
    })
);

// Authentication middleware for /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.session?.accessToken; // get access token from session

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Please log in." });
    }

    try {
        // Verify JWT token (replace 'your_secret_key' with your actual secret)
        const decoded = jwt.verify(token, 'fingerprint_customer');
        req.user = decoded; // store decoded user info in the request object
        next(); // user authenticated, proceed to route
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
});

const PORT = 5000;

// Routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start server
app.listen(PORT, () => console.log("Server is running"));
