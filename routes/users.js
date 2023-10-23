const router = require("express").Router();
const authenticateJwt = require("../authenticateJwt");
const userController = require("../controllers/userController");

// Matches with "/api/user"

router.use(authenticateJwt);

router.get("/getAll", userController.getAllUsers);

router.post("/create", userController.create);

router.post("/sendVerificationEmail", userController.sendVerificationEmail);

router.get("/getById", userController.getById);

router.put("/updateInfo", userController.updateInfo);

router.put("/updateRole", userController.updateRole);

router.put("/toggleStatus", userController.toggleStatus);

router.delete("/deleteUserById", userController.deleteUserById);

router.post("/sendResetEmail", userController.sendResetEmail);

router.post("/resetPassword", userController.resetPassword);

router.post("/updatePicture", userController.updatePicture);

module.exports = router;
