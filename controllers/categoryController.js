const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory.js");

async function create(req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).end();
    return;
  }

  try {
    const body = req.body;
    console.log(req.body);

    const category = { name: body.name };

    const result = await Category.create(category);
    res.status(200).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
}

async function getAll(req, res) {
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

  try {
    const result = await Category.update(body.category, {
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
  await Category.destroy({
    where: {
      id: req.query.id,
    },
  });
  res.status(200).end();
}

module.exports = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
};
