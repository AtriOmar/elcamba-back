const { Model, DataTypes } = require("sequelize");

const db = require("../config/database");

const Category = db.define(
  "Category",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.TEXT,
    color: DataTypes.TEXT,
  },
  {
    tableName: "categories",
  }
);

// Category.sync({ alter: true });

// Category.update(
//   {
//     color: "#3b82f6",
//   },
//   {
//     where: {},
//   }
// );

module.exports = Category;
