const { Model, DataTypes } = require("sequelize");

const db = require("../config/database");

const Product = db.define(
  "Product",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.TEXT,
    photos: DataTypes.TEXT,
    salePrice: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
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
const User = require("./User1");

SubCategory.hasMany(Product, { foreignKey: "subCategoryId" });
Product.belongsTo(SubCategory, { foreignKey: "subCategoryId" });

User.hasMany(Product, { foreignKey: "userId" });
Product.belongsTo(User, { foreignKey: "userId" });

// Product.sync({ alter: true });

const fse = require("fs-extra");

async function removeUnused() {
  const dir = await fse.readdir("./public/uploads/");
  const products = await Product.findAll();
  const photosArr = [];
  products.forEach((product) => {
    photosArr.push(...JSON.parse(product.photos));
  });
  console.log(photosArr);
  const notUsed = dir.filter((file) => file.indexOf(".") > 0 && !photosArr.includes(file));

  console.log(notUsed);

  // notUsed.forEach((curr) => {
  //   fse.remove("./public/uploads/" + curr);
  // });
}

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
