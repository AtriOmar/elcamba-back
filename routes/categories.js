const router = require("express").Router();
const authenticateJwt = require("../authenticateJwt");
const categoryController = require("../controllers/categoryController");

router.post("/create", authenticateJwt, categoryController.create);

router.get("/getAll", categoryController.getAll);

router.get("/getById", categoryController.getById);

router.put("/updateById", authenticateJwt, categoryController.updateById);

router.delete("/deleteById", authenticateJwt, categoryController.deleteById);

module.exports = router;
