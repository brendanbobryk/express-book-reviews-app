const express = require('express');
const axios = require('axios');
let users = require("./auth_users.js").users;
const books = require("./booksdb.js"); // local data for simulation
const public_users = express.Router();

/**
 * -------------------------------
 * Register a new user
 * -------------------------------
 */
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users[username]) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users[username] = { password };
    return res.status(201).json({ message: `User '${username}' successfully registered` });
});

/**
 * -------------------------------
 * Get all books
 * -------------------------------
 */
public_users.get('/', async (req, res) => {
    try {
        // Using Axios to simulate async fetch from local server
        const response = await axios.get('http://localhost:5000/booksdb.json').catch(() => ({ data: books }));
        return res.status(200).json(response.data);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books", error: err.message });
    }
});

/**
 * -------------------------------
 * Get book details by ISBN
 * -------------------------------
 */
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        // Using Axios to simulate async fetch
        const response = await axios.get('http://localhost:5000/booksdb.json').catch(() => ({ data: books }));
        const book = response.data[isbn];

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.status(200).json(book);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching book by ISBN", error: err.message });
    }
});

/**
 * -------------------------------
 * Get books by author
 * -------------------------------
 */
public_users.get('/author/:author', async (req, res) => {
    const authorName = req.params.author.toLowerCase();

    try {
        const response = await axios.get('http://localhost:5000/booksdb.json').catch(() => ({ data: books }));
        const allBooks = response.data;

        const matchingBooks = Object.keys(allBooks)
            .filter(key => allBooks[key].author.toLowerCase() === authorName)
            .map(key => ({ isbn: key, ...allBooks[key] }));

        if (matchingBooks.length > 0) {
            return res.status(200).json(matchingBooks);
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books by author", error: err.message });
    }
});

/**
 * -------------------------------
 * Get books by title
 * -------------------------------
 */
public_users.get('/title/:title', async (req, res) => {
    const titleName = req.params.title.toLowerCase();

    try {
        const response = await axios.get('http://localhost:5000/booksdb.json').catch(() => ({ data: books }));
        const allBooks = response.data;

        const matchingBooks = Object.keys(allBooks)
            .filter(key => allBooks[key].title.toLowerCase() === titleName)
            .map(key => ({ isbn: key, ...allBooks[key] }));

        if (matchingBooks.length > 0) {
            return res.status(200).json(matchingBooks);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books by title", error: err.message });
    }
});

/**
 * -------------------------------
 * Get reviews for a book by ISBN
 * -------------------------------
 */
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const response = await axios.get('http://localhost:5000/booksdb.json').catch(() => ({ data: books }));
        const book = response.data[isbn];

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.status(200).json(book.reviews);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching book reviews", error: err.message });
    }
});

module.exports.general = public_users;
