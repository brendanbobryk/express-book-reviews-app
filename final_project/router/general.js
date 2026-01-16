const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

/**
 * Register a new user
 * Endpoint: /register
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
 * Get all books in the shop (Task 10)
 * Endpoint: /
 * Using async/await to simulate an asynchronous fetch
 */
public_users.get('/', async (req, res) => {
    try {
        // Simulate async fetch (could also replace with Axios for an external API)
        const allBooks = await new Promise((resolve, reject) => {
            if (books) resolve(books);
            else reject("No books available");
        });

        return res.status(200).json(allBooks);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books", error: err });
    }
});

/**
 * Get book details by ISBN (Task 11)
 * Endpoint: /isbn/:isbn
 */
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const book = await new Promise((resolve, reject) => {
            if (books[isbn]) resolve(books[isbn]);
            else reject("Book not found");
        });

        return res.status(200).json(book);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

/**
 * Get books by author (Task 12)
 * Endpoint: /author/:author
 * Using Axios to fetch all books from local endpoint (simulating external API)
 */
public_users.get('/author/:author', async (req, res) => {
    const authorName = req.params.author.toLowerCase();

    try {
        // Fetch all books using Axios from local server
        const response = await axios.get('http://localhost:5000/');
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
 * Get books by title (Task 13)
 * Endpoint: /title/:title
 * Using async/await to filter books
 */
public_users.get('/title/:title', async (req, res) => {
    const titleName = req.params.title.toLowerCase();

    try {
        const matchingBooks = await new Promise((resolve) => {
            const result = [];
            for (let key in books) {
                if (books[key].title.toLowerCase() === titleName) {
                    result.push({ isbn: key, ...books[key] });
                }
            }
            resolve(result);
        });

        if (matchingBooks.length > 0) {
            return res.status(200).json(matchingBooks);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books by title", error: err });
    }
});

/**
 * Get book review
 * Endpoint: /review/:isbn
 */
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
