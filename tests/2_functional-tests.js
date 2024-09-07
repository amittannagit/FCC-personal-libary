'use strict';

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  */
  test('#example Test GET /api/books', function(done){
    chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        if (res.body.length > 0) {
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
        }
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'The Great Gatsby' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'title', 'Response should contain title');
            assert.property(res.body, '_id', 'Response should contain _id');
            assert.equal(res.body.title, 'The Great Gatsby');
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ }) // no title provided
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'missing required field title');
            done();
          });
      });
      
    });

    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books', function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            if (res.body.length > 0) {
              assert.property(res.body[0], 'title', 'Books in array should contain title');
              assert.property(res.body[0], '_id', 'Books in array should contain _id');
              assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
              assert.isNumber(res.body[0].commentcount, 'commentcount should be a number');
            }
            done();
          });
      });      
      
    });

    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db', function(done){
        chai.request(server)
          .get('/api/books/invalid-id')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db', function(done){
        // First, create a book to ensure a valid _id exists
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' })
          .end(function(err, res) {
            const id = res.body._id;
            chai.request(server)
              .get(`/api/books/${id}`)
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'title', 'Book should contain title');
                assert.property(res.body, '_id', 'Book should contain _id');
                assert.property(res.body, 'comments', 'Book should contain comments array');
                assert.isArray(res.body.comments, 'comments should be an array');
                done();
              });
          });
      });
      
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        // First, create a book to get a valid id
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book with Comments' })
          .end(function(err, res) {
            const id = res.body._id;
            chai.request(server)
              .post(`/api/books/${id}`)
              .send({ comment: 'This is a test comment' })
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'title', 'Book should contain title');
                assert.property(res.body, '_id', 'Book should contain _id');
                assert.property(res.body, 'comments', 'Book should contain comments array');
                assert.include(res.body.comments, 'This is a test comment', 'Comments array should include the new comment');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        // First, create a book to get a valid id
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Book without comment' })
          .end(function(err, res) {
            const id = res.body._id;
            chai.request(server)
              .post(`/api/books/${id}`)
              .send({ }) // No comment provided
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body, 'missing required field comment');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .post('/api/books/invalid-id')
          .send({ comment: 'This comment won\'t be added' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        // First, create a book to get a valid id
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Book to be deleted' })
          .end(function(err, res) {
            const id = res.body._id;
            chai.request(server)
              .delete(`/api/books/${id}`)
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body, 'delete successful');
                done();
              });
          });
      });

      test('Test DELETE /api/books/[id] with id not in db', function(done){
        chai.request(server)
          .delete('/api/books/invalid-id')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          });
      });

    });

  });

});
