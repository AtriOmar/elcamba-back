const Category = require("../models/Category");
const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory");

async function create(req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).send("not authorized");
    return;
  }
  const body = req.body;

  const result = await SubCategory.create({
    name: body.name,
    categoryId: body.categoryId,
  });

  console.log(result.toJSON());

  res.status(200).send(result);
}

async function getAll(req, res) {
  const result = await SubCategory.findAll({ include: Category });
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
  try {
    const result = await SubCategory.findAll({
      where: {
        categoryId: req.query.id,
      },
    });
    res.status(200).send(result);
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
}

async function updateById(req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).send("not authorized");
    return;
  }

  try {
    const result = await SubCategory.update(
      { name: req.body.name },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.status(200).send("updated");
  } catch (err) {
    res.status(400).send(err);
  }
}

async function deleteById(req, res) {
  if (!req.isAuthenticated() || req.user?.accessId < 3) {
    res.status(400).send("not authorized");
    return;
  }

  const { id, transferTo } = req.query;

  if (Number(transferTo) === -1) {
    res.status(200).end();
    return;
  }

  try {
    if (Number(transferTo) === -2) {
      await Product.destroy({
        where: {
          subCategoryId: id,
        },
      });
    }

    if (Number(transferTo) > 0) {
      await Product.update(
        {
          subCategoryId: Number(transferTo),
        },
        {
          where: {
            subCategoryId: id,
          },
        }
      );
    }

    await SubCategory.destroy({
      where: {
        id,
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
  getByCategId,
  updateById,
  deleteById,
};
