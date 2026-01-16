const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = {}; // change from array to object

// Check if username is available
const isValid = (username) => {
    return !users[username];
}

// Check if username & password match
const authenticatedUser = (username, password) => {
    return users[username] && users[username].password === password;
}

// Register a new user
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users[username] = { password: password };
    return res.status(201).json({ message: `User '${username}' successfully registered` });
});

// Login as registered user
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = jwt.sign(
        { username: username },
        "fingerprint_customer",
        { expiresIn: "1h" }
    );

    req.session.accessToken = accessToken;

    return res.status(200).json({
        message: `User '${username}' successfully logged in`,
        accessToken: accessToken
    });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review; // review is sent as query ?review=...
    const token = req.session?.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Please log in." });
    }

    // Decode username from JWT
    let decoded;
    try {
        decoded = jwt.verify(token, "fingerprint_customer");
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }

    const username = decoded.username;

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or update review
    books[isbn].reviews[username] = reviewText;

    return res.status(200).json({
        message: `Review added/updated for book '${books[isbn].title}' by '${username}'`,
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
