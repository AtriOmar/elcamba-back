const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory.js");
const Product = require("../models/Product");
const db = require("../config/database");

async function create(req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).end();
    return;
  }

  try {
    const body = req.body;

    const data = {
      name: body.name,
    };
    if (/^#[0-9A-Fa-f]{6}$/.test(body.color)) {
      data.color = body.color;
    } else {
      data.color = "#3b82f6";
    }

    const result = await Category.create(data);
    res.status(200).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
}

async function getAll(req, res) {
  // try {
  //   const result = await Product.min("price", {
  //     where: {
  //       subCategoryId: 12,
  //     },
  //   });

  //   console.log("-------------------- result --------------------");
  //   console.log(result);
  // } catch (error) {
  //   console.error("Error fetching categories:", error);
  //   res.status(500).send("Internal Server Error");
  //   return;
  // }

  const result = await Category.findAll({ include: SubCategory });
  res.status(200).send(result);
}

async function getById(req, res) {
  const result = await Category.findAll({
    where: {
      id: req.query.id,
    },
  });
  res.status(200).send(result);
}

async function updateById(req, res) {
  const body = req.body;

  const data = {
    name: body.name,
  };
  if (/^#[0-9A-Fa-f]{6}$/.test(body.color)) {
    data.color = body.color;
  } else {
    data.color = "#3b82f6";
  }

  try {
    const result = await Category.update(data, {
      where: {
        id: body.id,
      },
    });
    res.status(200).end();
  } catch (err) {
    res.status(400).send(err);
  }
}

async function deleteById(req, res) {
  if (!req.isAuthenticated) {
    res.status(400).send("not authorized");
    return;
  }

  try {
    await Category.destroy({
      where: {
        id: req.query.id,
      },
    });
    res.status(200).end();
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
}

module.exports = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
};
