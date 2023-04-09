const router = require('express').Router()
const newsController = require('../../controllers/newsController')

// Matches with "/api/user"
router
    .route('/')
    // GET "/api/user"
    .get(newsController.getAllNews) // Gets all the users
    // POST "/api/user" Example Request: { "vals": ["test_user", "111111", 1] }
    .post(newsController.createNewNews) // create a new user
//= ======================================================

// Matches with "/api/user/:id"
router
    .route('/:id')
    // GET "/api/user/:id"
    .get(newsController.getNewsById) // get user data by ID
    // PUT "/api/user/:id" Example Request: { "vals": ["test_user", "111111", 1] }
    .put(newsController.updateNewsById) // update a user by ID
    // DELETE "/api/user/:id"
    .delete(newsController.deleteNewsById) // delete a user by ID

module.exports = router
