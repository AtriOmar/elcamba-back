const { Model, DataTypes } = require("sequelize");

const db = require("../config/database");

const ProductView = db.define(
  "ProductView",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fingerprint: { type: DataTypes.TEXT },
  },
  {
    tableName: "product-views",
  }
);

const User = require("./User");
const Product = require("./Product");

User.hasMany(ProductView, { foreignKey: "userId" });
ProductView.belongsTo(User, { foreignKey: "userId" });

Product.hasMany(ProductView, { foreignKey: "productId" });
ProductView.belongsTo(Product, { foreignKey: "productId" });

// ProductView.sync({ alter: true });

module.exports = ProductView;
