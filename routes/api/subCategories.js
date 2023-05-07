const router = require("express").Router();
const subCategories = require("../../controllers/subCategoryController");

router.post("/create", subCategories.create);

router.get("/getAll", subCategories.getAll);

router.route("/getByCategId").get(subCategories.getByCategId);

// Matches with "/api/user/:id"
router
  .route("/:id")
  // GET "/api/user/:id"
  .get(subCategories.getById) // get user data by ID
  // PUT "/api/user/:id" Example Request: { "vals": ["test_user", "111111", 1] }
  .put(subCategories.updateById) // update a user by ID
  // DELETE "/api/user/:id"
  .delete(subCategories.deleteById); // delete a user by ID

module.exports = router;
