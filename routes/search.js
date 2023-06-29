const router = require("express").Router();
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Product = require("../models/Product");
const User = require("../models/User");
const { Op } = require("sequelize");

async function search(req, res) {
  const { search = "" } = req.query;

  try {
    const categories = () =>
      Category.findAll({
        where: {
          name: {
            [Op.like]: `%${search}%`,
          },
        },
        attributes: ["id", "name"],
      });

    const subs = () =>
      SubCategory.findAll({
        where: {
          name: {
            [Op.like]: `%${search}%`,
          },
        },
        attributes: ["id", "name"],
        include: { model: Category, attributes: ["id", "name"] },
      });

    const products = () =>
      Product.findAll({
        where: {
          name: {
            [Op.like]: `%${search}%`,
          },
          visible: true,
        },
        attributes: ["id", "name", "photos"],
        limit: 10,
      });

    const users = () =>
      User.findAll({
        where: {
          username: {
            [Op.like]: `%${search}%`,
          },
        },
        attributes: ["id", "username", "picture"],
        limit: 10,
      });

    const result = await Promise.all([categories(), subs(), products(), users()]);

    result.forEach((arr) => {
      arr = arr.map((el) => el.toJSON());
    });

    result[2].forEach((el) => {
      el.photos = JSON.parse(el.photos);
    });

    const response = {
      categories: result[0],
      subCategories: result[1],
      products: result[2],
      users: result[3],
    };

    res.send(response);
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
}

router.get("/", search);

module.exports = router;
