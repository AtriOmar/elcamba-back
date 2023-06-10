const router = require("express").Router();
const categoryController = require("../controllers/categoryController");

router.post("/create", categoryController.create);

router.get("/getAll", categoryController.getAll);

router.get("/getById", categoryController.getById);

router.post("/updateById", categoryController.updateById);

router.delete("/deleteById", categoryController.deleteById);

module.exports = router;
