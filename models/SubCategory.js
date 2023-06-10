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

const Category = require("./Category");

Category.hasMany(SubCategory, { foreignKey: "categoryId", onDelete: "CASCADE", onUpdate: "CASCADE" });
SubCategory.belongsTo(Category, { foreignKey: "categoryId", onDelete: "CASCADE", onUpdate: "CASCADE" });
// SubCategory.sync({ force: true });

// SubCategory.update({ categoryId: 5 }, { where: { id: { [Op.between]: [109, 115] } } });

// SubCategory.destroy({
//   where: {
//     categoryId: null,
//   },
// });

module.exports = SubCategory;
