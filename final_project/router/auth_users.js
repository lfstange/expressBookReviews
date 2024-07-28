const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 600 });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
 
   //Get th book based on ISBN
   let isbn = req.params.isbn;
   let reviewMessage = req.body.message;

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
        // Check if the book has reviews
        let reviewsList = book.reviews.list;

        if(!reviewsList){
          // Add a new review to the array. The user is the actual user logged in and the message is the review.
          reviewsList = [{user: req.session.authorization.username, comment: reviewMessage}];

          return res.status(300).json({message: "First review added successfully"});

        } else {
          // check if already exists a review from the user
          let checkReview = reviewsList.filter((rev) => {
            return rev.user === req.session.authorization.username;
          });

          if(checkReview.length > 0) {
           // Update the review
            checkReview[0].comment = reviewMessage;
            return res.status(300).json({message: "Review updated successfully"});

          } else {
            // Add a new review to the array. The user is the actual user logged in and the message is the review.
            reviewsList.push({user: req.session.authorization.username, comment: reviewMessage});
            return res.status(300).json({message: "New review added successfully to the list"});
          }
        }
      }
     ).catch(() => {
       return res.status(300).json({message: "Book not found"});
     });
   
   } else {
     return res.status(300).json({message: "No books available"});
   }

});


// Delete a review of a user
regd_users.delete("/auth/review/:isbn", (req, res) => {
 
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
       // Check if the book has reviews
       let reviewsList = book.reviews.list;

       if(reviewsList){
         // check if already exists a review from the user
         let checkReview = reviewsList.filter((rev) => {
           return rev.user === req.session.authorization.username;
         });

         if(checkReview.length > 0) {
          // Delete the review created by the user. Delete the item from the array.
            reviewsList = reviewsList.filter((rev) => {
            return rev.user !== req.session.authorization.username;
          }
          );

          book.reviews.list = reviewsList;

          return res.status(300).json({message: "Review deleted successfully"});
         }
       }
     }
    ).catch(() => {
      return res.status(300).json({message: "Book not found"});
    });
  
  } else {
    return res.status(300).json({message: "No books available"});
  }

});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
