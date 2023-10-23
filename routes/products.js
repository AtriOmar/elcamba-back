const router = require("express").Router();
const passport = require("passport");
const productController = require("../controllers/productController");
const authenticateJwt = require("../authenticateJwt");

router.post("/create", authenticateJwt, productController.create);

router.post("/update", authenticateJwt, productController.update);

router.put("/updateById", authenticateJwt, productController.updateById);

router.get("/getAll", productController.getAll);

router.get("/getByEachCategory", productController.getByEachCategory);

router.get("/getById", productController.getById);

router.get("/getByCategoryId", productController.getByCategoryId);

router.get("/getRandom", productController.getRandom);

router.delete("/deleteById", authenticateJwt, productController.deleteById);

router.get("/getByUserId", productController.getByUserId);

module.exports = router;
