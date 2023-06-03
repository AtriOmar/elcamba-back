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

const fse = require("fs-extra");

async function removeUnused() {
  const dir = await fse.readdir("./public/uploads/ads");
  const ads = await Ad.findAll();
  const photosArr = [];
  ads.forEach((ad) => {
    if (ad.photo) {
      photosArr.push(ad.photo);
    }
  });
  console.log(photosArr);
  const notUsed = dir.filter((file) => file.indexOf(".") > 0 && !photosArr.includes(file));

  console.log(notUsed);

  // notUsed.forEach((curr) => {
  //   fse.remove("./public/uploads/ads/" + curr);
  // });
}

// removeUnused();

module.exports = Ad;
