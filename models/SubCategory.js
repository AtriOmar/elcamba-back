const { Model, DataTypes, Op } = require("sequelize");

const db = require("../config/database");

const SubCategory = db.define(
  "SubCategory",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.TEXT,
  },
  {
    tableName: "sub-categories",
  }
);

const Categorie = require("./Categorie");

Categorie.hasMany(SubCategory, { foreignKey: "categoryId" });
SubCategory.belongsTo(Categorie, { foreignKey: "categoryId" });
// SubCategory.sync({ force: true });

// SubCategory.update({ categoryId: 5 }, { where: { id: { [Op.between]: [109, 115] } } });

module.exports = SubCategory;
