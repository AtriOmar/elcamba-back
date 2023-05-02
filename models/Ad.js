const { Model, DataTypes } = require("sequelize");

const db = require("../config/database");

const Ad = db.define(
  "Ad",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    photo: DataTypes.TEXT,
    name: DataTypes.TEXT,
    type: DataTypes.INTEGER,
    duration: DataTypes.INTEGER,
  },
  {
    tableName: "ads",
    timestamps: true,
  }
);

// Ad.sync({ force: true });

module.exports = Ad;
