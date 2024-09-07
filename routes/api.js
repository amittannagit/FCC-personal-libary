'use strict';

const { v4: uuidv4 } = require('uuid'); // For generating unique _id
const books = []; // In-memory array to store books

module.exports = function (app) {

  // Route for getting all books and adding a new book
  app.route('/api/books')
  .get(function (req, res) {
    // Respond with an array of all books with their title, _id, and commentcount
    const bookList = books.map(book => ({
      _id: book._id,
      title: book.title,
      commentcount: book.comments.length
    }));
    res.json(bookList);
  })
    
    .post(function (req, res) {
      const title = req.body.title;

      // Check if title is missing
      if (!title) {
        return res.json('missing required field title');
      }

      // Create a new book object with a unique _id
      const newBook = {
        _id: uuidv4(),
        title: title,
        comments: []
      };

      // Add the new book to the in-memory array
      books.push(newBook);

      // Respond with the newly created book (just title and _id)
      res.json({ _id: newBook._id, title: newBook.title });
    })
    
    .delete(function(req, res) {
      // Clear all books
      books.length = 0;
      res.json('complete delete successful');
    });

  // Route for handling individual books by their _id
  app.route('/api/books/:id')
    .get(function (req, res) {
      const bookid = req.params.id;
      const book = books.find(b => b._id === bookid);

      // If no book is found, return the appropriate message
      if (!book) {
        return res.json('no book exists');
      }

      // Return the book with its _id, title, and comments array
      res.json({ _id: book._id, title: book.title, comments: book.comments });
    })
    
    .post(function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;

      // Check if comment is missing
      if (!comment) {
        return res.json('missing required field comment');
      }

      const book = books.find(b => b._id === bookid);

      // If no book is found, return the appropriate message
      if (!book) {
        return res.json('no book exists');
      }

      // Add the comment to the book's comments array
      book.comments.push(comment);

      // Return the updated book object with _id, title, and comments array
      res.json({ _id: book._id, title: book.title, comments: book.comments });
    })
    
    .delete(function (req, res) {
      const bookid = req.params.id;
      const bookIndex = books.findIndex(b => b._id === bookid);

      // If no book is found, return the appropriate message
      if (bookIndex === -1) {
        return res.json('no book exists');
      }

      // Remove the book from the array
      books.splice(bookIndex, 1);

      // Respond with 'delete successful'
      res.json('delete successful');
    });
};
