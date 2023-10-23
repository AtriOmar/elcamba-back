const router = require("express").Router();
const authenticateJwt = require("../authenticateJwt");
const subCategoriesController = require("../controllers/subCategoryController");

router.post("/create", authenticateJwt, subCategoriesController.create);

router.get("/getAll", subCategoriesController.getAll);

router.put("/updateById", authenticateJwt, subCategoriesController.updateById);

router.route("/getByCategId").get(subCategoriesController.getByCategId);

router.delete("/deleteById", authenticateJwt, subCategoriesController.deleteById);

module.exports = router;
