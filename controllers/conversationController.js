const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { Op } = require("sequelize");

exports.create = async function create(req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).end();
    return;
  }

  try {
    const body = req.body;
    console.log(req.body);

    const Conversation = {
      userId1: body.userId1,
      userId2: body.userId2,
    };

    const result = await Conversation.create(Conversation);
    res.status(200).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.getAll = async function getAll(req, res) {
  try {
    const result = await Conversation.findAll();
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.getById = async function getById(req, res) {
  try {
    const result = await Conversation.findAll({
      where: {
        id: req.query.id,
      },
    });
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.getByUserId = async function getByUserId(req, res) {
  try {
    const result = await Conversation.findAll({
      where: {
        [Op.or]: [
          {
            userId1: req.userId,
          },
          {
            userId2: req.userId,
          },
        ],
      },
    });

    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.deleteById = async function deleteById(req, res) {
  try {
    await Conversation.destroy({
      where: {
        id: req.query.id,
      },
    });
    res.status(200).send("deleted");
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};
