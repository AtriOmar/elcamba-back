const formidable = require("formidable");
const Ad = require("../models/Ad");
const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory");
const User = require("../models/User1");
const uuidv4 = require("uuid").v4;
const fse = require("fs-extra");
const axios = require("axios");
const db = require("../config/database");
const { Op } = require("sequelize");
const sharp = require("sharp");

const headers = {
  "Content-type": "application/json",
  Authorization: `Token ${process.env.PAYMEE_TOKEN}`,
};

async function uploadFile(file) {
  const oldPath = file.filepath;
  const ext = file.originalFilename.slice(file.originalFilename.lastIndexOf("."));
  const newName = uuidv4().replaceAll("-", "").toString() + ext;
  const tempPath = "./public/uploads/temp/ads/" + newName;
  const newPath = "./public/uploads/ads/" + newName;
  const metadata = await sharp(oldPath).metadata();
  try {
    if (file.mimetype.endsWith("gif") || file.mimetype.endsWith("svg")) {
      await fse.move(oldPath, newPath);
    } else if (file.mimetype.endsWith("png")) {
      await sharp(oldPath)
        .resize({
          width: metadata.width > 2000 && metadata.width > metadata.height ? 2000 : undefined,
          height: metadata.height > 2000 && metadata.height > metadata.width ? 2000 : undefined,
        })
        .flatten({ background: "white" })
        .jpeg({ mozjpeg: true, force: true })
        .toFile(newPath);
    } else {
      await sharp(oldPath)
        .resize({
          width: metadata.width > 2000 && metadata.width > metadata.height ? 2000 : undefined,
          height: metadata.height > 2000 && metadata.height > metadata.width ? 2000 : undefined,
        })
        .jpeg({ mozjpeg: true, force: true })
        .toFile(newPath);
    }
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

async function createProductAd(req, res) {
  const { body } = req;

  const expiresAt = new Date(Date.now + duration * 24 * 3600 * 1000);
  const ad = {
    token: body.token,
    type: body.type,
    expiresAt,
    userId: req.user.id,
    productId: body.productId,
  };
  console.log(ad);
}

exports.createProductPayment = async function (req, res) {
  const { body } = req;

  const payload = {
    amount: body.amount,
    vendor: 2941,
    note: "Order 576587",
    first_name: "Omar",
    last_name: "Atri",
    email: "atri.omar.2003@gmail.com",
    phone: "+21624246962",
    return_url: "http://localhost:5173",
    cancel_url: "http://localhost:5173",
    webhook_url: "http://localhost:5173",
  };

  try {
    const result = await axios.post("https://sandbox.paymee.tn/api/v1/payments/create", payload, { headers });

    // const expiresAt = new Date(Date.now() + Number(body.duration) * 24 * 3600 * 1000);
    const ad = {
      token: result.data.data.token,
      type: 0,
      userId: req.user.id,
      productId: body.productId,
      duration: body.duration,
      amount: body.amount,
    };
    console.log("ad", ad);

    const adRes = await Ad.create(ad);
    console.log("ad res", adRes.toJSON());

    res.send(result.data.data.token);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.createPosterPayment = async function (req, res) {
  const { body } = req;

  const payload = {
    vendor: 2941,
    note: "Order 576587",
    first_name: "Omar",
    last_name: "Atri",
    email: "atri.omar.2003@gmail.com",
    phone: "+21624246962",
    return_url: "http://localhost:5173",
    cancel_url: "http://localhost:5173",
    webhook_url: "http://localhost:5173",
  };

  try {
    var form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, async function (err, fields, files) {
      if (err) {
        res.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
        res.end(String(err));
        return;
      }

      // console.log("fields", fields);
      // console.log("files", files);

      payload.amount = fields.amount;
      const paymentRes = await axios.post("https://sandbox.paymee.tn/api/v1/payments/create", payload, { headers });

      const photo = files.photo;

      console.log("photo", photo);
      console.log("width", photo.width);

      const photoName = await uploadFile(photo);
      console.log("photoName", photoName);

      const ad = {
        token: paymentRes.data.data.token,
        type: fields.type,
        userId: req.user.id,
        duration: fields.duration,
        photo: photoName,
        amount: fields.amount,
      };
      console.log("ad", ad);

      const adRes = await Ad.create(ad);
      console.log("ad res", adRes.toJSON());

      res.send(paymentRes.data.data.token);
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.toggleStatus = async function (req, res) {
  const { id } = req.body;

  try {
    const adRes = await Ad.findByPk(id);
    const ad = adRes.toJSON();

    if (ad.userId !== req.user.id) {
      res.status(400).send("not authorized");
      return;
    }

    await Ad.update(
      { active: !ad.active },
      {
        where: {
          id,
        },
      }
    );

    res.send("done");
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.getByToken = async function (req, res) {
  const { token } = req.query;

  try {
    const adRes = await Ad.findOne({
      where: {
        token,
      },
      include: { model: Product, attributes: ["id", "name", "photos"] },
    });
    const ad = adRes?.toJSON();
    if (ad?.Product?.photos) ad.Product.photos = JSON.parse(ad?.Product?.photos);

    res.send(ad);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.check = async function (req, res) {
  const { token } = req.query;

  console.log("token", token);
  try {
    const result = await axios.get(`https://sandbox.paymee.tn/api/v1/payments/${token}/check`, { headers });
    console.log("payment check", result.data);
    res.send(result.data.data.payment_status);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.pay = async function (req, res) {
  const { token } = req.query;

  try {
    const ad = (
      await Ad.findOne({
        where: {
          token,
        },
        attributes: ["id", "duration"],
      })
    ).toJSON();

    const result = await axios.get(`https://sandbox.paymee.tn/api/v1/payments/${token}/check`, { headers });
    console.log("payment check", result.data);
    const status = result.data.data.payment_status;
    if (status) {
      const newData = {
        paid: new Date(),
        active: true,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + Number(ad.duration) * 24 * 3600 * 1000),
      };
      const adRes = await Ad.update(newData, {
        where: {
          token,
        },
      });
      console.log("ad", adRes);
    }

    res.send(status);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.getByUserId = async function (req, res) {
  const { type, status, order, orderBy, limit, page } = req.query;

  const options = {
    where: {
      userId: req.user.id,
      ...(type === "product" ? { type: 0 } : type === "poster" ? { type: { [Op.ne]: 0 } } : {}),
      ...(status === "active"
        ? { active: 1, expiresAt: { [Op.gt]: Date.now() } }
        : status === "inactive"
        ? { [Op.or]: [{ active: 0 }, { expiresAt: { [Op.lt]: Date.now() } }] }
        : {}),
    },
    limit: Number(limit) >= 1 ? Number(limit) : 10,
    offset: Number(limit) >= 1 && Number(page) >= 1 ? Number(limit) * (Number(page) - 1) : 0,
    order: [[orderBy === "expiresAt" ? "expiresAt" : "startsAt", order === "desc" ? "desc" : "asc"]],
  };
  console.log("options", options);

  try {
    const ads = await Ad.findAll({
      ...options,
      include: { model: Product, attributes: ["name", "photos"] },
    });

    ads.forEach((ad) => {
      if (ad.Product) {
        ad.Product.photos = JSON.parse(ad.Product.photos);
      }
    });

    res.send(ads);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.getRandom = async function (req, res) {
  const { limit, type } = req.query;

  try {
    const result = await Ad.findAll({
      include: Product,
      limit: Number(limit) || 20,
      order: db.random(),
      where: {
        type,
        active: true,
        expiresAt: {
          [Op.gt]: new Date(),
        },
        startsAt: {
          [Op.lt]: new Date(),
        },
      },
    });
    result.forEach((ad) => {
      if (ad.Product) {
        ad.Product.photos = JSON.parse(ad.Product.photos);
      }
    });
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(JSON.stringify(err));
  }
};

async function getAll(req, res) {
  console.log("getting all");
  const result = await Ad.findAll();
  res.status(200).send(result);
}

async function getById(req, res) {
  const result = await Ad.findByPk(req.query.id, {
    include: { model: Product, attributes: ["name", "photos"] },
  });
  const ad = result.toJSON();
  if (result.Product) {
    result.Product.photos = JSON.parse(ad.Product.photos);
  }
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

exports.getByEachType = async function getByEachType(req, res) {
  const { limit } = req.query;

  function fetchOneType(type) {
    return Ad.findAll({
      order: db.random(),
      where: {
        type,
        active: true,
        expiresAt: {
          [Op.gt]: new Date(),
        },
        startsAt: {
          [Op.lt]: new Date(),
        },
      },
      limit: Number(limit),
      include: Product,
    });
  }

  try {
    const result = await Promise.all([0, 1, 2, 3].map(fetchOneType));

    result[0].forEach((ad) => {
      if (ad.Product) {
        ad.Product.photos = JSON.parse(ad.Product.photos);
      }
    });

    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

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
  ...module.exports,
  create,
  createProductAd,
  getAll,
  getById,
  getByType,
  getLatest,
  deleteById,
};
