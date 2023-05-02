const Categorie = require("../models/Categorie.js");
const db = require("../models/index.js");
const SubCategory = require("../models/SubCategory.js");

async function create(req, res) {
  if (req.isAuthenticated()) {
    const body = req.body;

    console.log(body);
    const result = await SubCategory.create({
      name: body.name,
      categoryId: body.categId,
    });

    console.log(result.toJSON());

    res.status(200).send(result);
  } else {
    res.status(400);
  }
}

async function getAll(req, res) {
  const result = await SubCategory.findAll({ include: Categorie });
  res.status(200).send(result);
}

async function getById(req, res) {
  const result = await SubCategory.findAll({
    where: {
      id: req.query.id,
    },
  });
  res.status(200).send(result);
}

async function getByCategId(req, res) {
  const { query } = req;
  console.log(query);
  res.status(200).send();
  return;
  const result = await SubCategory.findAll({
    where: {
      id: req.query.id,
    },
  });
  res.status(200).send(result);
}

async function updateById(req, res) {
  const body = req.body;

  try {
    const result = await SubCategory.update(body, {
      where: {
        id: req.query.id,
      },
    });
    res.status(200).end();
  } catch (err) {
    res.status(400).send(err);
  }
}

async function deleteById(req, res) {
  await SubCategory.destroy({
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
  getByCategId,
  updateById,
  deleteById,
};
