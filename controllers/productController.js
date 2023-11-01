const formidable = require("formidable");
const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory.js");
const uuidv4 = require("uuid").v4;
const fse = require("fs-extra");
const User = require("../models/User.js");
const Category = require("../models/Category");
const ProductView = require("../models/ProductView");
const db = require("../config/database");
const { Op } = require("sequelize");
const sharp = require("sharp");

async function uploadFile(file) {
  const oldPath = file.filepath;
  const ext = file.originalFilename.slice(file.originalFilename.lastIndexOf("."));
  const newName = uuidv4().replaceAll("-", "").toString() + ext;
  const newPath = "./public/uploads/" + newName;
  try {
    await fse.move(oldPath, newPath);
    const compressed = await sharp(newPath).resize(300).toBuffer();
    await fse.outputFile("./public/uploads/thumbnails/" + newName, compressed);
    console.log(newName);
    return newName;
  } catch (err) {
    return err;
  }
}

exports.create = async function create(req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).send("not authorized");
    return;
  }

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
      try {
        const { photos, name, subCategoryId, salePrice, price, description, delivery, city, address } = fields;
        const data = { photos, name, subCategoryId, salePrice, price, description, delivery, city, address };

        const filesArr = Object.values(files);

        const photosNames = await Promise.all(filesArr.map(uploadFile));
        console.log(photosNames);
        data.photos = JSON.stringify(photosNames);

        data.userId = req.user.id;

        data.price ||= 0;

        const result = await Product.create(data);

        res.status(200).send(result);
      } catch (error) {
        res.status(400).send(error);
      }
    });
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

function removeFile(file) {
  return fse.remove("./public/uploads/" + file);
}

exports.update = async function update(req, res) {
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

    const { id } = fields;
    const { photos, name, subCategoryId, salePrice, price, description, delivery, city, address } = fields;
    const newProduct = { photos, name, subCategoryId, salePrice, price, description, delivery, city, address };

    newProduct.photos = JSON.parse(newProduct.photos);

    const product = (await Product.findByPk(id)).toJSON();
    product.photos = JSON.parse(product.photos);

    const removedPhotos = product?.photos?.filter?.((photo) => !newProduct.photos.includes(photo)) || [];
    await Promise.all(removedPhotos?.map(removeFile));

    const photosArr = await Promise.all(filesArr.map(uploadFile));
    console.log(photos);
    newProduct.photos.push(...photosArr);

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

    res.status(200).send("updated");
  });
};

exports.updateById = async function (req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).send("not authorized");
    return;
  }

  const { id, active, sold } = req.body;
  try {
    const product = (await Product.findByPk(id)).toJSON();

    if (req.user.accessId < 3 && product.userId !== req.user.id) {
      res.status(400).send("not authorized");
    }

    const newData = {};

    if (active !== undefined) {
      newData.active = active;
    }

    if (sold !== undefined) {
      newData.sold = sold;
    }

    const result = await Product.update(newData, {
      where: {
        id,
      },
    });

    const newProduct = (await Product.findByPk(id, { include: { model: User, attributes: ["id", "username", "picture", "phone", "accessId"] } })).toJSON();

    newProduct.photos = JSON.parse(newProduct.photos);

    res.send(newProduct);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.getAll = async function getAll(req, res) {
  const { limit, orderBy, order, search = "", active, userId } = req.query;

  const options = {
    where: {
      name: {
        [Op.like]: `%${search}%`,
      },
    },
    limit: Number(limit) >= 1 ? Number(limit) : undefined,
    include: [
      { model: User, attributes: { exclude: "password" } },
      { model: SubCategory, include: Category },
    ],
  };

  if (active === "true") {
    options.where.sold = false;
    options.where.active = 2;
  } else if (active === "false") {
    options.where.active = {
      [Op.ne]: 2,
    };
  }

  if (Number(userId) >= 1) {
    options.where.userId = Number(userId);
  }

  if (orderBy) {
    options.order = [[]];
    if (orderBy === "name") options.order[0][0] = "name";
    else if (orderBy === "createdAt") options.order[0][0] = "createdAt";
    else options.order[0][0] = "id";

    if (order === "asc") options.order[0][1] = "asc";
    else options.order[0][1] = "desc";
  }

  console.log("-------------------- options --------------------");
  console.log(options);

  const result = await Product.findAll(options);
  // console.log("result", result);
  result.forEach((product) => {
    product.photos = JSON.parse(product.photos);
  });
  res.status(200).send(result);
};

exports.getById = async function getById(req, res) {
  try {
    const result = await Product.findByPk(req.query.id, {
      attributes: {
        include: [[db.literal(`( SELECT COUNT(*) FROM \`product-views\` WHERE \`product-views\`.productId = ${req.query.id} )`), "views"]],
      },
      include: [
        {
          model: SubCategory,
          attributes: ["id", "name"],
          include: {
            model: Category,
            attributes: ["id", "name"],
          },
        },
        { model: User, attributes: ["id", "username", "picture", "phone", "accessId"] },
      ],
    });

    result && (result.photos = JSON.parse(result.photos));

    if (req.user && req.query.view === "true" && result) {
      console.log("-------------------- finding or creating a new view --------------------");
      const a = await ProductView.findOrCreate({
        where: {
          userId: req.user.id,
          productId: req.query.id,
        },
        defaults: {
          userId: req.user.id,
          productId: req.query.id,
        },
      });
    }

    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.getByCategoryId = async function getByCategoryId(req, res) {
  console.log("-------------------- req.user from products getByCategoryId --------------------");
  console.log(req.user);

  const { categoryId, subCategoryId, limit = 25, page = 1, min, max, order, orderBy, delivery, search = "", userId, active = 2 } = req.query;

  const filteredCities = req.query.cities === "all" ? "all" : req.query.cities?.split?.("-").map?.((city) => cities[city]);

  // if (!categoryId && !subCategoryId) {
  //   res.status(400).send("invalid data");
  //   return;
  // }

  // --------------------------------------------
  // --------------------------------------------
  const options = {
    attributes: {
      include: [[db.literal(`CASE WHEN salePrice = 0 THEN price ELSE salePrice END`), "priceWithSale"]],
    },
    where: {
      active,
    },
    order: [[]],
  };
  let minPrice = 0,
    maxPrice = 0;
  try {
    if (userId && !isNaN(userId)) {
      var user = (await User.findByPk(Number(userId), { attributes: { exclude: ["password"] } })).toJSON();

      const productsCount = await Product.count({
        where: {
          active: 2,
          userId,
        },
      });

      const soldProductsCount = await Product.count({
        where: {
          userId,
          active: 2,
          sold: true,
        },
      });

      user.productsCount = productsCount;

      user.soldProductsCount = soldProductsCount;

      options.where.userId = Number(userId);

      minPrice = (
        await Product.findOne({
          attributes: [[db.literal(`MIN(CASE WHEN salePrice = 0 THEN price ELSE LEAST(price, salePrice) END)`), "minPrice"]],
          where: {
            active,
            userId: Number(userId),
          },
          raw: true,
        })
      ).minPrice;

      maxPrice = await Product.max("price", {
        where: {
          active,
          userId: Number(userId),
        },
      });
    } else if (subCategoryId && !isNaN(subCategoryId)) {
      const subRes = await SubCategory.findByPk(subCategoryId, {
        include: Category,
      });
      var subCategory = await subRes?.toJSON();

      if (!subCategory) {
        res.status(400).send("category not found");
        return;
      }

      options.where = {
        subCategoryId,
      };

      minPrice = (
        await Product.findOne({
          attributes: [[db.literal(`MIN(CASE WHEN salePrice = 0 THEN price ELSE LEAST(price, salePrice) END)`), "minPrice"]],
          where: {
            active,
            subCategoryId,
          },
          raw: true,
        })
      ).minPrice;
      maxPrice = await Product.max("price", {
        where: {
          active,
          subCategoryId,
        },
      });

      console.log("-------------------- subCategoryId --------------------");
      console.log(subCategoryId);
    } else if (categoryId && !isNaN(categoryId)) {
      const dbCategory = await Category.findByPk(categoryId);
      var category = await dbCategory?.toJSON();

      if (!category) {
        res.status(400).send("category not found");
        return;
      }

      options.include = [{ model: SubCategory, where: { categoryId }, include: Category }];

      minPrice = (
        await Product.findOne({
          attributes: [[db.literal(`MIN(CASE WHEN salePrice = 0 THEN price ELSE LEAST(price, salePrice) END)`), "minPrice"]],
          where: {
            active,
          },
          include: {
            model: SubCategory,
            where: {
              categoryId,
            },
          },
          raw: true,
        })
      ).minPrice;
      maxPrice = await Product.max("price", {
        where: {
          active,
        },
        include: {
          model: SubCategory,
          where: {
            categoryId,
          },
        },
      });

      console.log("-------------------- categoryId --------------------");
      console.log(categoryId);
    } else {
      minPrice = (
        await Product.findOne({
          attributes: [[db.literal(`MIN(CASE WHEN salePrice = 0 THEN price ELSE LEAST(price, salePrice) END)`), "minPrice"]],
          where: {
            active,
          },
          raw: true,
        })
      ).minPrice;
      maxPrice = await Product.max("price", {
        where: {
          active,
        },
      });
    }

    // const minVar = (
    //   await Product.findOne({
    //     attributes: [[db.literal(`MIN(CASE WHEN salePrice = 0 THEN price ELSE LEAST(price, salePrice) END)`), "minPrice"]],
    //     where: {
    //       subCategoryId: 7,
    //     },
    //   })
    // ).toJSON();

    // console.log("-------------------- minVar --------------------");
    // console.log(minVar);

    options.where = {
      ...options.where,
      visible: true,
      sold: false,
      // price: {
      //   [Op.gte]: !isNaN(min) ? Number(min) : undefined,
      //   [Op.lte]: !isNaN(max) ? Number(max) : undefined,
      // },
    };

    if ((min && !isNaN(min)) || (max && !isNaN(max))) {
      options.where.price = {};

      if (min && !isNaN(min)) {
        options.where.price[Op.gte] = Number(min);
      }

      if (max && !isNaN(max)) {
        options.where.price[Op.lte] = Number(max);
      }
    }

    console.log("-------------------- min, max --------------------");
    console.log(min, max);

    if (["createdAt", "price", "name"].includes(orderBy)) {
      options.order[0][0] = orderBy === "price" ? "priceWithSale" : orderBy;
    } else {
      options.order[0][0] = "id";
    }

    if (order === "desc") options.order[0][1] = "desc";
    else options.order[0][1] = "asc";

    if (delivery === "y") {
      options.where.delivery = {
        [Op.ne]: "",
      };
    }

    if (filteredCities !== "all") {
      options.where.city = {
        [Op.in]: filteredCities,
      };
    }

    options.limit = Number(limit) >= 1 ? Number(limit) : 10;
    options.offset = Number(page) >= 1 ? Number(limit) * (Number(page) - 1) : 1;

    options.where.name = {
      [Op.like]: `%${search}%`,
    };

    const { count, rows } = await Product.findAndCountAll(options);

    rows.forEach((product) => {
      product.photos = JSON.parse(product.photos);
    });

    const response = {
      minPrice,
      maxPrice,
      products: rows,
      count,
    };

    if (userId && !isNaN(userId)) {
      response.user = user;
    } else if (subCategoryId && !isNaN(subCategoryId)) {
      response.subCategory = subCategory;
      response.category = subCategory.Category;
    } else if (categoryId && !isNaN(categoryId)) {
      response.category = category;
    }

    res.status(200).send(response);
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

exports.getByEachCategory = async function (req, res) {
  const { limit } = req.query;

  function fetchByOneCategory(category) {
    return Product.findAll({
      where: {
        "$SubCategory.categoryId$": category.id,
        active: 2,
      },
      order: db.random(),
      include: {
        model: SubCategory,
        attributes: ["categoryId"],
      },
      limit: Number(limit) >= 1 ? Number(limit) : 20,
    });
  }

  try {
    const categories = (
      await Category.findAll({
        attributes: ["id", "name", "color"],
      })
    ).map((el) => el.toJSON());

    const products = await Promise.all(categories.map(fetchByOneCategory));

    const response = [];

    products.forEach((arr, index) => {
      arr.forEach((el) => {
        el.photos = JSON.parse(el.photos);
      });
      if (arr?.length) response.push({ category: categories[index], products: arr });
    });

    res.send(response);
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

exports.getRandom = async function getRandom(req, res) {
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
};

exports.getByUserId = async function getByUserId(req, res) {
  const { limit, orderBy, order, search = "" } = req.query;

  const options = {
    where: {
      userId: req.query.id,
      name: {
        [Op.like]: `%${search}%`,
      },
    },
    limit: Number(limit) >= 1 ? Number(limit) : undefined,
    include: [{ model: User, attributes: { exclude: "password" } }, SubCategory],
    order: [[]],
  };

  if (orderBy === "name") options.order[0][0] = "name";
  else if (orderBy === "createdAt") options.order[0][0] = "createdAt";
  else options.order[0][0] = "id";

  if (order === "asc") options.order[0][1] = "asc";
  else options.order[0][1] = "desc";

  console.log("-------------------- options --------------------");
  console.log(options);

  try {
    const result = await Product.findAll(options);
    console.log("result", result);
    result.forEach((product) => {
      product.photos = JSON.parse(product.photos);
    });
    res.status(200).send(result);
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

exports.deleteById = async function deleteById(req, res) {
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
};

const cities = [
  "ariana",
  "béja",
  "ben arous",
  "bizerte",
  "gabes",
  "gafsa",
  "jendouba",
  "kairouan",
  "kasserine",
  "kebili",
  "la manouba",
  "le kef",
  "mahdia",
  "médenine",
  "monastir",
  "nabeul",
  "sfax",
  "sidi bouzid",
  "siliana",
  "sousse",
  "tataouine",
  "tozeur",
  "tunis",
  "zaghouan",
];

async function createThumbnails() {
  try {
    var dir = await fse.readdir("./public/uploads");
    console.log(dir);
    dir.forEach(async (filename) => {
      const stat = await fse.stat("./public/uploads/" + filename);
      if (stat.isFile()) {
        const compressed = await sharp("./public/uploads/" + filename)
          .resize(300)
          .toBuffer();
        await fse.outputFile("./public/uploads/thumbnails/" + filename, compressed);
      }
    });
  } catch (err) {
    console.log(err);
  }
}

// createThumbnails();
