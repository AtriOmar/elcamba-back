const formidable = require("formidable");
const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory.js");
const uuidv4 = require("uuid").v4;
const fse = require("fs-extra");
const User = require("../models/User1.js");
const Category = require("../models/Categorie");

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

    const result = await Product.create(fields);

    res.status(200).send(result);
  });
}

async function getAll(req, res) {
  const result = await Product.findAll({
    include: [
      { model: User, attributes: { exclude: "password" } },
      { model: SubCategory, include: Category },
    ],
  });
  result.forEach((product) => {
    product.photos = JSON.parse(product.photos);
  });
  res.status(200).send(result);
}

async function getById(req, res) {
  const result = await Product.findByPk(req.params.id);
  res.status(200).send(result);
}

async function getLatest(req, res) {
  const result = await Product.findAll({
    order: [["createdAt", "desc"]],
    limit: req.query.limit,
  });
  result.forEach((product) => {
    product.photos = JSON.parse(product.photos);
  });
  res.status(200).send(result);
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
  await Product.destroy({
    where: {
      id: req.params.id,
    },
  });
  res.status(200).end();
}

module.exports = {
  create,
  getAll,
  getById,
  getLatest,
  deleteById,
  getByUserId,
};
