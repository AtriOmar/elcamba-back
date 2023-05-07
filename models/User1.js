const { Model, DataTypes } = require("sequelize");

const db = require("../config/database");

const User = db.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: DataTypes.TEXT,
    email: DataTypes.TEXT,
    password: DataTypes.TEXT,
    accessId: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN,
    resetToken: DataTypes.TEXT,
    resetTokenExpires: DataTypes.DATE,
  },
  {
    tableName: "users",
  }
);

// User.sync({ alter: true });

// SubCategory.update({ categoryId: 5 }, { where: { id: { [Op.between]: [109, 115] } } });

module.exports = User;
