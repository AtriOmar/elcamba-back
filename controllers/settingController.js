const { Op } = require("sequelize");
const Setting = require("../models/Setting");

exports.create = async function create(req, res) {
  if (!req.isAuthenticated() || req.user?.accessId < 3) {
    res.status(400).send("not authorized");
    return;
  }

  const { name, value } = req.body;

  try {
    const settings = await Setting.create({
      name,
      value,
      required: false,
    });

    res.send(settings);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.getAll = async function getAll(req, res) {
  if (!req.isAuthenticated() || req.user?.accessId < 3) {
    res.status(400).send("not authorized");
    return;
  }

  try {
    const settings = await Setting.findAll({ attributes: ["id", "name", "value", "required"] });

    res.send(settings);
  } catch (err) {
    res.status(400).send(err);
  }
};

// Setting.create({
//   name: "prix affiche 4",
//   value: "5",
// });

exports.update = async function update(req, res) {
  if (!req.isAuthenticated() || req.user?.accessId < 3) {
    res.status(400).send("not authorized");
    return;
  }

  const { id, value } = req.body;

  console.log("-------------------- req.body --------------------");
  console.log(req.body);

  if (req.user?.accessId < 3) {
    res.status(400).send("not authorized");
    return;
  }

  try {
    await Setting.update(
      {
        value: value,
      },
      {
        where: {
          id,
        },
      }
    );

    const newSetting = await Setting.findByPk(id, {
      attributes: ["id", "name", "value"],
    });

    res.send(newSetting);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.deleteById = async function (req, res) {
  const { id } = req.query;

  try {
    await Setting.destroy({
      where: {
        id,
      },
    });

    res.send("deleted");
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};
