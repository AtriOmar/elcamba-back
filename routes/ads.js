const router = require("express").Router();
const passport = require("passport");
const adController = require("../controllers/adController");
const authenticateJwt = require("../authenticateJwt");

router.post("/create", adController.create);

router.post("/createProductAd", authenticateJwt, adController.createProductAd);

router.post("/createProductPayment", authenticateJwt, adController.createProductPayment);

router.post("/createPosterPayment", authenticateJwt, adController.createPosterPayment);

router.put("/updateById", authenticateJwt, adController.updateById);

router.get("/getByToken", adController.getByToken);

router.get("/check", adController.check);

router.get("/pay", adController.pay);

router.get("/getRandom", adController.getRandom);

router.get("/getByUserId", adController.getByUserId);

router.get("/getAll", adController.getAll);

router.get("/getById", adController.getById);

router.get("/getByType", adController.getByType);

router.get("/getByEachType", adController.getByEachType);

router.get("/getLatest", adController.getLatest);

router.delete("/deleteById", authenticateJwt, adController.deleteById);

module.exports = router;
