const router = require("express").Router();
const productController = require("../../controllers/productController");

router.post("/create", productController.create);

router.get("/getAll", productController.getAll);

router.get("/getById", productController.getById);

router.get("/getByCategoryId", productController.getByCategoryId);

router.get("/getLatest", productController.getLatest);

router.get("/getRandom", productController.getRandom);

router.delete("/deleteById", productController.deleteById);

router.get("/getByUserId", productController.getByUserId);

module.exports = router;
