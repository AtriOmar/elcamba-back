const formidable = require("formidable");
const Ad = require("../models/Ad");
const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory");
const User = require("../models/User");
const uuidv4 = require("uuid").v4;
const fse = require("fs-extra");
const axios = require("axios");
const db = require("../config/database");
const { Op } = require("sequelize");
const sharp = require("sharp");
const passport = require("passport");

const headers = {
  "Content-type": "application/json",
  Authorization: `Token ${process.env.PAYMEE_TOKEN}`,
};

async function uploadFile(file) {
  const oldPath = file.filepath;
  const ext = file.originalFilename.slice(file.originalFilename.lastIndexOf("."));
  const newName = uuidv4().replaceAll("-", "").toString() + ext;
  const tempPath = "./public/uploads/temp/abc/" + newName;
  const newPath = "./public/uploads/abc/" + newName;
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
  if (!req.isAuthenticated()) {
    res.status(400).send("not authorized");
    return;
  }

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
    vendor: process.env.PAYMEE_VENDOR,
    note: "Order",
    first_name: "ELCAMBA",
    last_name: "ELCAMBA",
    email: "elcamba@gmail.com",
    phone: "+21600000000",
    return_url: process.env.FRONTEND_URL,
    cancel_url: process.env.FRONTEND_URL,
    webhook_url: process.env.FRONTEND_URL,
  };

  const data = {
    receiverWalletId: process.env.WALLET_ID,
    token: "TND",
    type: "immediate",
    description: "Paiement de prix d'annonce",
    acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR"],
    lifespan: 60,
    amount: Number(body.amount) * 1000,
    checkoutForm: true,
    // "addPaymentFeesToAmount": true,
    // firstName: "ELCAMBA",
    // lastName: "ELCAMBA",
    // phoneNumber: "00000000",
    // email: "elcamba.net.0@gmail.com",
    // orderId: "1234657",
    // webhook: process.env.FRONTEND_URL + "/payment-done/webhook",
    // silentWebhook: true,
    successUrl: process.env.FRONTEND_URL + "/payment-done/success",
    failUrl: process.env.FRONTEND_URL + "/payment-done/fail",
    theme: "light",
  };

  try {
    // const result = await axios.post("https://sandbox.paymee.tn/api/v1/payments/create", payload, { headers });
    paymentRes = await axios.post("https://api.preprod.konnect.network/api/v2/payments/init-payment", data, {
      headers: {
        "x-api-key": process.env.KONNECT_API_KEY,
      },
    });

    // const expiresAt = new Date(Date.now() + Number(body.duration) * 24 * 3600 * 1000);
    const ad = {
      token: paymentRes.data.paymentRef,
      type: 0,
      userId: req.user.id,
      productId: body.productId,
      duration: body.duration,
      amount: body.amount,
    };
    console.log("ad", ad);

    const adRes = await Ad.create(ad);
    console.log("ad res", adRes.toJSON());

    res.send(paymentRes.data.paymentRef);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.createPosterPayment = async function (req, res) {
  const payload = {
    vendor: process.env.PAYMEE_VENDOR,
    note: "Order",
    first_name: "ELCAMBA",
    last_name: "ELCAMBA",
    email: "elcamba@gmail.com",
    phone: "+21600000000",
    return_url: process.env.FRONTEND_URL,
    cancel_url: process.env.FRONTEND_URL,
    webhook_url: process.env.FRONTEND_URL,
  };

  const data = {
    receiverWalletId: process.env.WALLET_ID,
    token: "TND",
    type: "immediate",
    description: "Paiement de prix d'annonce",
    acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR"],
    lifespan: 60,
    checkoutForm: true,
    // "addPaymentFeesToAmount": true,
    // firstName: "ELCAMBA",
    // lastName: "ELCAMBA",
    // phoneNumber: "00000000",
    // email: "elcamba.net.0@gmail.com",
    // orderId: "1234657",
    // webhook: process.env.FRONTEND_URL + "/payment-done/webhook",
    // silentWebhook: true,
    successUrl: process.env.FRONTEND_URL + "/payment-done/success",
    failUrl: process.env.FRONTEND_URL + "/payment-done/fail",
    theme: "light",
  };

  var form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, async function (err, fields, files) {
    if (err) {
      res.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
      res.end(String(err));
      return;
    }
    try {
      // console.log("fields", fields);
      // console.log("files", files);

      payload.amount = fields.amount;
      data.amount = fields.amount * 1000;
      let paymentRes;
      // paymentRes = await axios.post("https://sandbox.paymee.tn/api/v1/payments/create", payload, { headers });
      paymentRes = await axios.post("https://api.preprod.konnect.network/api/v2/payments/init-payment", data, {
        headers: {
          "x-api-key": process.env.KONNECT_API_KEY,
        },
      });

      const photo = files.photo;

      console.log("photo", photo);
      console.log("width", photo.width);

      const photoName = await uploadFile(photo);

      const ad = {
        // token: paymentRes.data.data.token,
        token: paymentRes.data.paymentRef,
        type: fields.type,
        userId: req.user.id,
        duration: fields.duration,
        photo: photoName,
        amount: fields.amount,
        url: fields.url,
      };
      console.log("ad", ad);

      const adRes = await Ad.create(ad);
      console.log("ad res", adRes.toJSON());

      res.send(paymentRes.data.paymentRef);
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  });
};

exports.updateById = async function (req, res) {
  // console.log("-------------------- updateById --------------------");
  // await new Promise((resolve, reject) => {
  //   passport.authenticate("jwt", { session: false }, (err, user) => {
  //     if (err || !user) {
  //       console.log("-------------------- user from authenticate update --------------------");
  //       console.log(user);

  //       return resolve();
  //     }

  //     console.log("-------------------- user from authenticate update --------------------");
  //     console.log(user);
  //     req.logIn(user, function (err) {
  //       console.log("-------------------- err from authenticate update --------------------");
  //       console.log(err);
  //     });
  //     return resolve();
  //   })(req, res);
  // });

  console.log("-------------------- req.user after authenticate update --------------------");
  console.log(req.user);

  if (!req.isAuthenticated()) {
    res.status(400).send("not authorized");
    return;
  }

  const { id, active, paid, url } = req.body;

  try {
    const ad = (await Ad.findByPk(id)).toJSON();

    if (req.user.accessId < 3 && ad.userId !== req.user.id) {
      res.status(400).send("not authorized");
      return;
    }

    const newData = {};

    if (active !== undefined) {
      newData.active = active;
    }

    if (paid !== undefined) {
      newData.paid = new Date();
      newData.active = 2;
      newData.startsAt = new Date();
      newData.expiresAt = new Date(Date.now() + Number(ad.duration) * 24 * 3600 * 1000);
    }

    if (url !== undefined) {
      newData.url = url;
    }

    const result = await Ad.update(newData, {
      where: {
        id,
      },
    });

    const newAd = (
      await Ad.findByPk(id, { include: [{ model: Product }, { model: User, attributes: ["id", "username", "picture", "phone", "accessId"] }] })
    ).toJSON();

    res.send(newAd);
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

    ad.paymentUrl = "https://gateway.sandbox.konnect.network/pay?payment_ref=" + ad.token;

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

    // const result = await axios.get(`https://sandbox.paymee.tn/api/v1/payments/${token}/check`, { headers });
    const result = await axios.get(`https://api.preprod.konnect.network/api/v2/payments/${token}`, { headers });
    console.log("payment check", JSON.stringify(result.data, null, 2));
    const status = result.data.payment.status === "completed";
    if (status) {
      const newData = {
        paid: new Date(),
        active: 2,
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
    },
    limit: Number(limit) >= 1 ? Number(limit) : undefined,
    offset: Number(limit) >= 1 && Number(page) >= 1 ? Number(limit) * (Number(page) - 1) : 0,
    order: [[orderBy === "expiresAt" ? "expiresAt" : "startsAt", order === "desc" ? "desc" : "asc"]],
  };

  if (type === "product") {
    options.where.type = 0;
  } else if (type === "poster") {
    options.where.type = { [Op.ne]: 0 };
  }

  if (status === "active") {
    options.where.active = 2;
    options.where.expiresAt = { [Op.gt]: Date.now() };
  } else if (status === "inactive") {
    options.where[Op.or] = [{ active: { [Op.ne]: 2 } }, { expiresAt: { [Op.lt]: Date.now() } }];
  }
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
  const { limit, orderBy, order, search = "", active, type, userId } = req.query;

  const options = {
    where: {},
    limit: Number(limit) >= 1 ? Number(limit) : undefined,
    include: [{ model: User, attributes: { exclude: "password" }, where: { username: { [Op.like]: `%${search}%` } } }, { model: Product }],
  };

  if (type === "product") {
    options.where.type = 0;
  } else if (type === "poster") {
    options.where.type = { [Op.ne]: 0 };
  } else if (type && Number(type) >= 0 && Number(type) <= 4) {
    options.where.type = Number(type);
  }

  console.log("-------------------- req.query --------------------");
  console.log(req.query);

  if (Number(userId) >= 1) {
    options.where.userId = Number(userId);
  }

  if (active === "true") {
    options.where.active = 2;
    options.where.paid = { [Op.not]: null };
    options.where.expiresAt = { [Op.gt]: Date.now() };
  } else if (active === "false") {
    options.where[Op.or] = [{ active: { [Op.ne]: 2 } }, { expiresAt: { [Op.lt]: Date.now() } }];
  }

  if (orderBy === "random") {
    options.order = db.random();
  } else if (orderBy) {
    options.order = [[]];
    if (["createdAt", "expiresAt"].includes(orderBy)) {
      options.order[0][0] = orderBy;
    } else {
      options.order[0][0] = "id";
    }

    if (order === "asc") options.order[0][1] = "asc";
    else options.order[0][1] = "desc";
  }

  // console.log("-------------------- options --------------------");
  // console.log(options);

  try {
    const result = await Ad.findAll(options);
    // console.log("result", result);
    result?.forEach?.((ad) => {
      if (ad?.Product) {
        ad.Product.photos = JSON.parse(ad.Product.photos);
      }
    });
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
}

async function getById(req, res) {
  try {
    const result = await Ad.findByPk(req.query.id, {
      include: [
        { model: Product, attributes: ["name", "photos"] },
        { model: User, exclude: ["password"] },
      ],
    });
    const ad = result?.toJSON?.();
    if (result?.Product) {
      result.Product.photos = JSON.parse(ad.Product.photos);
    }
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
}

async function getByType(req, res) {
  const { type, limit, active } = req.query;

  const options = {
    order: db.random(),
    where: {
      type,
    },
    limit: Number(limit) >= 1 ? Number(limit) : undefined,
    include: Product,
  };

  if (active) {
    options.where = {
      ...options.where,
      active: 2,
      expiresAt: {
        [Op.gt]: new Date(),
      },
      startsAt: {
        [Op.lt]: new Date(),
      },
    };
  }

  try {
    const result = await Ad.findAll(options);

    result.forEach((ad) => {
      if (ad.Product) {
        ad.Product.photos = JSON.parse(ad.Product.photos);
      }
    });

    res.status(200).send(result);
  } catch (err) {
    console.log("--------------------  --------------------");
    console.log(err);
    res.status(400).send(err);
  }
}

exports.getByEachType = async function getByEachType(req, res) {
  const { limit } = req.query;

  function fetchOneType(type) {
    return Ad.findAll({
      order: db.random(),
      where: {
        type,
        active: 2,
        expiresAt: {
          [Op.gt]: new Date(),
        },
        startsAt: {
          [Op.lt]: new Date(),
        },
      },
      limit: type === 0 ? 10 : Number(limit),
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
    await fse.remove("./public/uploads/abc/" + ad.photo);
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
