const { Model, DataTypes } = require("sequelize");

const db = require("../config/database");

const Category = db.define(
  "Category",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.TEXT,
  },
  {
    tableName: "categories",
  }
);

module.exports = Category;
