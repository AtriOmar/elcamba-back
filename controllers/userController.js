const db = require("../models/index.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../models/User1");

async function create(req, res) {
  const body = req.body;

  const hash = await bcrypt.hash(body.password, saltRounds);
  const userData = {
    username: body.username,
    email: body.email,
    password: hash,
    accessId: 1,
  };

  console.log(userData);
  const [result, created] = await User.findOrCreate({
    where: {
      email: body.email,
    },
    defaults: userData,
  });
  const user = await result.toJSON();

  if (!created) {
    res.status(400).send("email already used");
    return;
  }

  req.logIn(user, (err) => {
    res.status(200).send(user);
  });
}

async function getAllUsers(req, res) {
  const result = await User.findAll();
  res.status(200).send(result);
}

async function getUserById(req, res) {
  const result = await User.findByPk(req.query.id);
  res.status(200).send(result);
}

async function updateUserById(req, res) {
  const userData = req.body.vals; // grab onto the new user array of values
  bcrypt.hash(userData[1], saltRounds, (err, hash) => {
    if (err) {
      console.error(err);
    }
    // use the index of the password value to pass to bcrypt
    userData[1] = hash; // replace plain text password with hash
    db.User.updateOne(userData, req.params.id, (result) => {
      if (result.changedRows === 0) {
        res.status(204).end();
      } else {
        res.status(200).end();
      }
    });
  });
}

async function deleteUserById(req, res) {
  db.User.deleteOne(req.params.id, (data) => {
    res.status(200).json(data);
  });
}

module.exports = {
  create,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
