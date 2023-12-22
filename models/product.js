const { Model, DataTypes, Sequelize } = require("sequelize");

const db = require("../config/database");

const Product = db.define(
  "Product",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.TEXT,
    photos: DataTypes.TEXT,
    salePrice: DataTypes.DECIMAL(13, 3),
    price: DataTypes.DECIMAL(13, 3),
    description: DataTypes.TEXT,
    delivery: DataTypes.TEXT,
    city: {
      type: DataTypes.TEXT,
      defaultValue: "sfax",
    },
    address: DataTypes.TEXT,
    visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    active: { type: DataTypes.INTEGER, defaultValue: 2 },
    sold: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

const SubCategory = require("./SubCategory");
const User = require("./User");

SubCategory.hasMany(Product, { foreignKey: "subCategoryId", onDelete: "CASCADE", onUpdate: "CASCADE" });
Product.belongsTo(SubCategory, { foreignKey: "subCategoryId", onDelete: "CASCADE", onUpdate: "CASCADE" });

User.hasMany(Product, { foreignKey: "userId" });
Product.belongsTo(User, { foreignKey: "userId" });

// Product.sync({ alter: true });

// const fse = require("fs-extra");

// async function removeUnused() {
//   const dir = await fse.readdir("./public/uploads/");
//   const products = await Product.findAll();
//   const photosArr = [];
//   products.forEach((product) => {
//     photosArr.push(...JSON.parse(product.photos));
//   });
//   console.log(photosArr);
//   const notUsed = dir.filter((file) => file.indexOf(".") > 0 && !photosArr.includes(file));

//   console.log(notUsed);

//   notUsed.forEach((curr) => {
//     fse.remove("./public/uploads/" + curr);
//   });
// }

// removeUnused();

// Product.update(
//   { photos: "[]" },
//   {
//     where: {
//       id: 1,
//     },
//   }
// );

module.exports = Product;

const { Op } = require("sequelize");

// async function test() {
//   const result = await Product.min("price", {
//     include: {
//       model: SubCategory,
//       where: {
//         CategoryId: 2,
//       },
//     },
//   });

//   console.log("-------------------- result --------------------");
//   console.log(result);
// }

// test();
