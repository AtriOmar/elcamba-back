const router = require("express").Router();
const adController = require("../../controllers/adController");

router.post("/create", adController.create);

router.get("/getAll", adController.getAll);

router.get("/getById", adController.getById);

router.get("/getByType", adController.getByType);

router.get("/getLatest", adController.getLatest);

router.delete("/deleteById", adController.deleteById);

module.exports = router;
