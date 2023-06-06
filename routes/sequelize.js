const router = require("express").Router();

const db = require("../config/database");
const Category = require("../models/Category");

// Matches with "/api/user"
router.route("/").get(async (req, res) => {
  const result = await Category.findAll();
  console.log(result);
  res.status(200).send(result);
});

module.exports = router;
