const router = require("express").Router();
const categoryController = require("../../controllers/categoryController");

// Matches with "/api/user"
router
  .route("/")
  // GET "/api/user"
  .get(categoryController.getAllCategories) // Gets all the users
  // POST "/api/user" Example Request: { "vals": ["test_user", "111111", 1] }
  .post(categoryController.create); // create a new user
//= ======================================================

router.post("/create", categoryController.create);

// Matches with "/api/user/:id"
router
  .route("/:id")
  // GET "/api/user/:id"
  .get(categoryController.getCategoryById) // get user data by ID
  // PUT "/api/user/:id" Example Request: { "vals": ["test_user", "111111", 1] }
  .put(categoryController.updateCategoryById) // update a user by ID
  // DELETE "/api/user/:id"
  .delete(categoryController.deleteCategoryById); // delete a user by ID

module.exports = router;
