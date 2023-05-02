const formidable = require("formidable");
const Ad = require("../models/Ad");
const uuidv4 = require("uuid").v4;
const fse = require("fs-extra");

async function uploadFile(file) {
  const oldPath = file.filepath;
  const ext = file.originalFilename.slice(file.originalFilename.lastIndexOf("."));
  const newName = uuidv4().replaceAll("-", "").toString() + ext;
  const newPath = "./public/uploads/ads/" + newName;
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

  var form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, async function (err, fields, files) {
    if (err) {
      res.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
      res.end(String(err));
      return;
    }

    // console.log("fields", fields);
    // console.log("files", files);

    const file = Object.values(files)[0];

    const photo = await uploadFile(file);
    console.log(photo);
    fields.photo = photo;

    console.log(photo);

    const result = await Ad.create(fields);

    res.status(200).send(result);
  });
}

async function getAll(req, res) {
  console.log("getting all");
  const result = await Ad.findAll();
  res.status(200).send(result);
}

async function getById(req, res) {
  const result = await Ad.findByPk(req.query.id);
  res.status(200).send(result);
}

async function getByType(req, res) {
  console.log("query", req.query);
  const result = await Ad.findAll({
    where: {
      type: req.query.type || 1,
    },
  });
  res.status(200).send(result);
}

async function getLatest(req, res) {
  const result = await Ad.findAll({
    order: [["createdAt", "desc"]],
    limit: req.query.limit,
  });
  res.status(200).send(result);
}

async function deleteById(req, res) {
  console.log(req.body);

  try {
    const ad = await Ad.findByPk(req.body.id);
    await fse.remove("./public/uploads/ads/" + ad.photo);
    await Ad.destroy({
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
  getAll,
  getById,
  getByType,
  getLatest,
  deleteById,
};
