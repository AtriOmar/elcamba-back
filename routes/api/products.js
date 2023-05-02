const router = require("express").Router();
const productController = require("../../controllers/productController");

router.post("/create", productController.create);

router.get("/getAll", productController.getAll);

router.get("/getById", productController.getById);

router.get("/getLatest", productController.getLatest);

router.delete("/deleteById", productController.deleteById);

router.get("/getByUserId", productController.getByUserId);

module.exports = router;
