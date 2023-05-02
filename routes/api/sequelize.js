const router = require("express").Router();

const db = require("../../config/database");
const Categorie = require("../../models/Categorie");

// Matches with "/api/user"
router.route("/").get(async (req, res) => {
  const result = await Categorie.findAll();
  console.log(result);
  res.status(200).send(result);
});

module.exports = router;
