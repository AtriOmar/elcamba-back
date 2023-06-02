const { Model, DataTypes, DATE } = require("sequelize");

const db = require("../config/database");

const Ad = db.define(
  "Ad",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    token: DataTypes.TEXT,
    amount: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    photo: DataTypes.TEXT,
    paid: DataTypes.DATE,
    active: { type: DataTypes.BOOLEAN, defaultValue: false },
    duration: DataTypes.INTEGER,
    startsAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    expiresAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "ads",
    timestamps: true,
  }
);

const Product = require("./Product");
const User = require("./User1");

Product.hasMany(Ad, { foreignKey: "productId" });
Ad.belongsTo(Product, { foreignKey: "productId" });

User.hasMany(Ad, { foreignKey: "userId" });
Ad.belongsTo(User, { foreignKey: "userId" });

// Ad.sync({ alter: true });

module.exports = Ad;
