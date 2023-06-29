const router = require("express").Router();
const settingController = require("../controllers/settingController");

router.post("/create", settingController.create);

router.get("/getAll", settingController.getAll);

router.put("/update", settingController.update);

router.delete("/deleteById", settingController.deleteById);

module.exports = router;
