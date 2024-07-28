const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios')
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

   if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });

    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});



// Get the book list available in the shop
public_users.get('/', function (req, res) {
   
  let booksList = new Promise((resolve, reject) => {
    if (Object.keys(books).length > 0) {
      resolve(books);
    } else {
      reject(null);
    }
  })

  booksList.then((booksList) => {
    return res.status(300).json(books);
  }).catch(() => {
    return res.status(300).json({message: "No books available"});
  });

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {

    //Get th book based on ISBN
    let isbn = req.params.isbn;

    // If books are available, 
    if (Object.keys(books).length > 0) {

      // Create a Promise to Search the book with the ISBN
      new Promise((resolve, reject) => {
        for (let i in books) {
          if (books[i].ISBN === isbn) {
            resolve(books[i]);
          }
        }
        reject(null);

      }).then((book) => {
          return res.status(300).json(book);
      }
      ).catch(() => {
        return res.status(300).json({message: "Book not found"});
      });
    
    } else {
      return res.status(300).json({message: "No books available"});
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  // If books are available,
  if (Object.keys(books).length > 0) {
    // Create a Promise to filter the books based on the author
    new Promise((resolve, reject) => {

      let booksMatch = [];
      for (let i in books) {
        let authorDB = books[i].author;
        if (authorDB === author) {
          booksMatch.push(books[i]);
        }
      }
      if (booksMatch.length > 0) {
        resolve(booksMatch);
      } else {
        reject(null);
      }
    } ).then((booksMatch) => {
        return res.status(300).json(booksMatch);
    } ).catch(() => {
        return res.status(300).json({message: "No books available"});
    });
  } else {
    return res.status(300).json({message: "No books available"});
  }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
      const response = Object.values(books).find(x => x.title === title)
      res.status(200).json(response);
  } catch (error) {
      res.status(500).json({ message: "Error fetching books by title", error: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  // If books are available,
  if (Object.keys(books).length > 0) {
    // Create a Promise to search the book review based on the ISBN
    new Promise((resolve, reject) => {

      for (let i in books) {
        if (books[i].ISBN === isbn) {

          // If exists reviews, return the reviews
          if (Object.keys(books[i].reviews).length > 0) {
            resolve(books[i].reviews);
          } else {
            resolve("The book" + books[i].title + ", ISBN = " + books[i].ISBN + ", has no reviews");
          }
        }
      }
      reject(null);

    }).then((reviews) => {
        return res.status(300).json(reviews);
    }).catch(() => {
        return res.status(300).json({message: "Book not found"});
    });
  } else {
    return res.status(300).json({message: "No books available"});
  }
});

module.exports.general = public_users;
