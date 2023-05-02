const db = require("../models/index.js");
const Categorie = require("../models/Categorie");
const SubCategory = require("../models/SubCategory.js");

function createNewCategory(req, res) {
  if (req.isAuthenticated()) {
    const body = req.body;

    const category = [body.name];
    // console.log(userData)
    db.Category.insertOne(category, (result) => {
      // save new user with hashed password to database
      res.status(200).json({ id: result.insertId });
    });
  } else {
    res.status(400);
  }
}

async function getAllCategories(req, res) {
  const result = await Categorie.findAll({ include: SubCategory });
  res.status(200).send(result);
}

async function getCategoryById(req, res) {
  const result = await Categorie.findAll({
    where: {
      id: req.query.id,
    },
  });
  res.status(200).send(result);
}

async function updateCategoryById(req, res) {
  const body = req.body;

  try {
    const result = await Categorie.update(body, {
      where: {
        id: req.params.id,
      },
    });
    res.status(200).end();
  } catch (err) {
    res.status(400).send(err);
  }
}

async function deleteCategoryById(req, res) {
  await Categorie.destroy({
    where: {
      id: req.params.id,
    },
  });
  res.status(200).end();
}

module.exports = {
  createNewCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
};
