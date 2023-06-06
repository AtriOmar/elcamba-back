const Message = require("../models/Message");

async function create(req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).end();
    return;
  }

  try {
    const body = req.body;
    console.log(req.body);

    const message = {
      content: body.content,
    };

    const result = await Message.create(message);
    res.status(200).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
}

async function getAll(req, res) {
  try {
    const result = await Message.findAll();
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
}

async function getById(req, res) {
  try {
    const result = await Message.findAll({
      where: {
        id: req.query.id,
      },
    });
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
}

async function getByUserId(req, res) {
  try {
    const result = await Message.findAll({
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
}

async function deleteById(req, res) {
  try {
    await Message.destroy({
      where: {
        id: req.query.id,
      },
    });
    res.status(200).send("deleted");
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
}

module.exports = {
  create,
  getAll,
  getById,
  getByUserId,
  deleteById,
};
