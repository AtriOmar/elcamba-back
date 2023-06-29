const router = require("express").Router();
const subCategoriesController = require("../controllers/subCategoryController");

router.post("/create", subCategoriesController.create);

router.get("/getAll", subCategoriesController.getAll);

router.put("/updateById", subCategoriesController.updateById);

router.route("/getByCategId").get(subCategoriesController.getByCategId);

router.delete("/deleteById", subCategoriesController.deleteById);

module.exports = router;
