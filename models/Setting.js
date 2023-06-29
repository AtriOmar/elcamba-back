const { Model, DataTypes } = require("sequelize");

const db = require("../config/database");

const Setting = db.define(
  "Setting",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.TEXT,
    value: DataTypes.TEXT,
    required: DataTypes.BOOLEAN,
  },
  {
    tableName: "settings",
  }
);

// Setting.sync({ alter: true });

// Setting.update(
//   {
//     color: "#3b82f6",
//   },
//   {
//     where: {},
//   }
// );

module.exports = Setting;
