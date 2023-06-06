const router = require("express").Router();
const conversationController = require("../controllers/conversationController");

router.post("/create", conversationController.create);

router.get("/getAll", conversationController.getAll);

router.get("/getByUserId", conversationController.getByUserId);

router.get("/getById", conversationController.getById);

router.delete("/deleteById", conversationController.deleteById);

module.exports = router;
