const router = require("express").Router();
const messagesController = require("../controllers/messageController");

router.post("/create", messagesController.create);

router.get("/getAll", messagesController.getAll);

router.get("/getByUserId", messagesController.getByUserId);

router.get("/getById", messagesController.getById);

router.delete("/deleteById", messagesController.deleteById);

module.exports = router;
