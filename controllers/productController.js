const formidable = require("formidable");
const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory.js");
const uuidv4 = require("uuid").v4;
const fse = require("fs-extra");
const User = require("../models/User1.js");
const Category = require("../models/Category");
const db = require("../config/database");
const { Op } = require("sequelize");

async function uploadFile(file) {
  const oldPath = file.filepath;
  const ext = file.originalFilename.slice(file.originalFilename.lastIndexOf("."));
  const newName = uuidv4().replaceAll("-", "").toString() + ext;
  const newPath = "./public/uploads/" + newName;
  try {
    await fse.move(oldPath, newPath);
    console.log(newName);
    return newName;
  } catch (err) {
    return err;
  }
}

async function create(req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).send("not authorized");
    return;
  }

  console.log(req.user);
  var form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, async function (err, fields, files) {
    if (err) {
      res.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
      res.end(String(err));
      return;
    }

    // console.log("fields", fields);
    // console.log("files", files);

    const filesArr = Object.values(files);

    const photos = await Promise.all(filesArr.map(uploadFile));
    console.log(photos);
    fields.photos = JSON.stringify(photos);

    fields.userId = req.user.id;

    fields.price ||= 0;

    const result = await Product.create(fields);

    res.status(200).send(result);
  });
}

function removeFile(file) {
  return fse.remove("./public/uploads/" + file);
}

async function update(req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).send("not authorized");
    return;
  }

  var form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, async function (err, fields, files) {
    if (err) {
      res.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
      res.end(String(err));
      return;
    }

    console.log("fields", fields);
    console.log("files", files);

    const filesArr = Object.values(files);
    const { id, ...newProduct } = fields;

    newProduct.photos = JSON.parse(newProduct.photos);

    const product = (await Product.findByPk(id)).toJSON();
    product.photos = JSON.parse(product.photos);

    const removedPhotos = product.photos.filter((photo) => !newProduct.photos.includes(photo));
    await Promise.all(removedPhotos.map(removeFile));

    const photos = await Promise.all(filesArr.map(uploadFile));
    console.log(photos);
    newProduct.photos.push(...photos);

    newProduct.photos = JSON.stringify(newProduct.photos);

    await Product.update(newProduct, {
      where: {
        id,
      },
    });

    // const filesArr = Object.values(files);

    // const photos = await Promise.all(filesArr.map(uploadFile));
    // console.log(photos);
    // fields.photos = JSON.stringify(photos);

    // fields.userId = req.user.id;

    // fields.price ||= 0;

    // const result = await Product.create(fields);

    res.status(200).send("result");
  });
}

async function getAll(req, res) {
  try {
    const result = await Product.findAll({
      where: {
        visible: true,
        sold: false,
      },
      include: [
        { model: User, attributes: { exclude: "password" } },
        { model: SubCategory, include: Category },
      ],
    });
    result.forEach((product) => {
      product.photos = JSON.parse(product.photos);
    });
    res.status(200).send(result);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(400).send(JSON.stringify(err));
  }
}

async function getById(req, res) {
  try {
    const result = await Product.findByPk(req.query.id, {
      include: [
        {
          model: SubCategory,
          attributes: ["id", "name"],
          include: { model: Category, attributes: ["id", "name"] },
        },
        { model: User, attributes: ["id", "username"] },
      ],
    });

    result.photos = JSON.parse(result.photos);

    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
}

async function getByCategoryId(req, res) {
  const { categoryId, subCategoryId, limit = 10, page = 1, min = 0, max = 5000, order, orderBy } = req.query;

  console.log("orderBy", orderBy, "order", order);

  if ((!categoryId || isNaN(categoryId)) && (!subCategoryId || isNaN(subCategoryId))) {
    res.status(400).send("invalid data");
    return;
  }

  try {
    if (subCategoryId && !isNaN(subCategoryId)) {
      const dbSub = await SubCategory.findByPk(subCategoryId, {
        include: Category,
      });
      const subCategory = await dbSub?.toJSON();

      if (!subCategory) {
        res.status(400).send("category not found");
        return;
      }

      const { count, rows } = await Product.findAndCountAll({
        where: {
          subCategoryId,
          price: {
            [Op.gte]: !isNaN(min) ? Number(min) : 0,
            [Op.lte]: !isNaN(max) ? Number(max) : 5000,
          },
          visible: true,
          sold: false,
        },
        order: [[orderBy, order]],
        limit: !isNaN(limit) ? Number(limit) : 10,
        offset: !isNaN(page) ? Number(limit) * (Number(page) - 1) : 1,
      });

      rows.forEach((product) => {
        product.photos = JSON.parse(product.photos);
      });

      const response = {
        subCategory,
        category: subCategory.Category,
        products: rows,
        count,
      };

      res.status(200).send(response);
    } else {
      const dbCategory = await Category.findByPk(categoryId);
      const category = await dbCategory?.toJSON();

      if (!category) {
        res.status(400).send("category not found");
        return;
      }

      const { count, rows } = await Product.findAndCountAll({
        include: [{ model: SubCategory, where: { categoryId }, include: Category }],
        where: {
          price: {
            [Op.gte]: !isNaN(min) ? Number(min) : 0,
            [Op.lte]: !isNaN(max) ? Number(max) : 5000,
          },
          visible: true,
          sold: false,
        },
        order: [[orderBy, order]],
        limit: !isNaN(limit) ? Number(limit) : 10,
        offset: !isNaN(page) ? Number(limit) * (Number(page) - 1) : 1,
      });

      rows.forEach((product) => {
        product.photos = JSON.parse(product.photos);
      });

      const response = {
        category,
        products: rows,
        count,
      };

      res.status(200).send(response);
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
}

async function getLatest(req, res) {
  const result = await Product.findAll({
    order: [["createdAt", "desc"]],
    limit: Number(req.query.limit) || 20,
  });
  result.forEach((product) => {
    product.photos = JSON.parse(product.photos);
  });
  res.status(200).send(result);
}

async function getRandom(req, res) {
  const { categoryId, subCategoryId } = req.query;

  let options = {};
  if (categoryId && !isNaN(categoryId)) {
    options.include = {
      model: SubCategory,
      attributes: ["id", "categoryId"],
      where: {
        categoryId,
      },
    };
  } else if (subCategoryId && !isNaN(subCategoryId)) {
    options.where = { subCategoryId };
  }

  try {
    const result = await Product.findAll({
      limit: Number(req.query.limit) || 20,
      order: db.random(),
      ...options,
    });
    result.forEach((product) => {
      product.photos = JSON.parse(product.photos);
    });
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(JSON.stringify(err));
  }
}

async function getByUserId(req, res) {
  const result = await Product.findAll({
    where: {
      userId: req.query.id,
    },
    include: [{ model: User, attributes: { exclude: "password" } }, SubCategory],
  });
  console.log("result", result);
  result.forEach((product) => {
    product.photos = JSON.parse(product.photos);
  });
  res.status(200).send(result);
}

async function deleteById(req, res) {
  try {
    const product = await Product.findByPk(req.body.id);
    const photos = JSON.parse(product.photos);
    await Promise.all(photos.map(removeFile));
    await Product.destroy({
      where: {
        id: req.body.id,
      },
    });
    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(400).send(JSON.stringify(err));
  }
}

module.exports = {
  create,
  update,
  getAll,
  getById,
  getByCategoryId,
  getLatest,
  getRandom,
  deleteById,
  getByUserId,
};
