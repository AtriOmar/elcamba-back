const router = require("express").Router();
const adController = require("../controllers/adController");

router.post("/create", adController.create);

router.post("/createProductAd", adController.createProductAd);

router.post("/createProductPayment", adController.createProductPayment);

router.post("/createPosterPayment", adController.createPosterPayment);

router.post("/toggleStatus", adController.toggleStatus);

router.get("/getByToken", adController.getByToken);

router.get("/check", adController.check);

router.get("/pay", adController.pay);

router.get("/getRandom", adController.getRandom);

router.get("/getByUserId", adController.getByUserId);

router.get("/getAll", adController.getAll);

router.get("/getById", adController.getById);

router.get("/getByType", adController.getByType);

router.get("/getLatest", adController.getLatest);

router.delete("/deleteById", adController.deleteById);

module.exports = router;
