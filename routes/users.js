const router = require("express").Router();
const userController = require("../controllers/userController");

// Matches with "/api/user"

router.get("/getAll", userController.getAllUsers);

router.post("/create", userController.create);

router.get("/getById", userController.getUserById);

router.put("/updateInfo", userController.updateInfo);

router.delete("/deleteUserById", userController.deleteUserById);

router.post("/sendResetEmail", userController.sendResetEmail);

router.post("/resetPassword", userController.resetPassword);

router.post("/updatePicture", userController.updatePicture);

module.exports = router;
