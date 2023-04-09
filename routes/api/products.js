const router = require('express').Router()
const productController = require('../../controllers/productController')

// Matches with "/api/user"
router
    .route('/')
    // GET "/api/user"
    .get(productController.getAllProducts) // Gets all the users
    // POST "/api/user" Example Request: { "vals": ["test_user", "111111", 1] }
    .post(productController.createNewProduct) // create a new user
//= ======================================================

// Matches with "/api/user/:id"
router
    .route('/:id')
    // GET "/api/user/:id"
    .get(productController.getProductById) // get user data by ID
    // PUT "/api/user/:id" Example Request: { "vals": ["test_user", "111111", 1] }
    .put(productController.updateProductById) // update a user by ID
    // DELETE "/api/user/:id"
    .delete(productController.deleteProductById) // delete a user by ID

module.exports = router
