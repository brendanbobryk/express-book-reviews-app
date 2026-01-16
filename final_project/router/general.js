const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body; // get data from request body

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username already exists
    if (users[username]) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Register the new user
    users[username] = { "password": password };
    return res.status(201).json({ message: `User '${username}' successfully registered` });
});

// Get the book list available in the shop using async/await
public_users.get('/', async (req, res) => {
    try {
        // Simulate async fetch with a Promise
        const allBooks = await new Promise((resolve, reject) => {
            if (books) resolve(books);
            else reject("No books available");
        });

        // Respond with JSON
        return res.status(200).json(allBooks);

        // Optional: if you wanted to use Axios to fetch from an API:
        // const response = await axios.get('https://your-api/books');
        // return res.status(200).json(response.data);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books", error: err });
    }
});

// Get book details by ISBN using async/await
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        // Simulate async fetch using a Promise
        const book = await new Promise((resolve, reject) => {
            if (books[isbn]) resolve(books[isbn]);
            else reject("Book not found");
        });

        return res.status(200).json(book);

        // Optional: if you were fetching from an external API using Axios:
        // const response = await axios.get(`https://your-api/books/${isbn}`);
        // return res.status(200).json(response.data);

    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

// Get books by author using async/await
public_users.get('/author/:author', async (req, res) => {
    const authorName = req.params.author.toLowerCase();

    try {
        // Use Axios to fetch all books from a local endpoint
        const response = await axios.get('http://localhost:5000'); // fetching all books
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

// Get books by title using async/await
public_users.get('/title/:title', async (req, res) => {
    const titleName = req.params.title.toLowerCase();

    try {
        // Simulate async fetch using a Promise
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

        // Optional Axios example:
        // const response = await axios.get(`https://your-api/books?title=${titleName}`);
        // return res.status(200).json(response.data);

    } catch (err) {
        return res.status(500).json({ message: "Error fetching books by title", error: err });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // get ISBN from URL
    const book = books[isbn];     // get the book by ISBN

    if (book) {
        return res.send(JSON.stringify(book.reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
