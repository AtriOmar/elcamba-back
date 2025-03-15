const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../models/User.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const formidable = require("formidable");
const uuidv4 = require("uuid").v4;
const fse = require("fs-extra");
const sharp = require("sharp");

async function create(req, res) {
  const body = req.body;

  const hash = await bcrypt.hash(body.password, saltRounds);
  const userData = {
    username: body.username,
    email: body.email,
    password: hash,
    accessId: 1,
    active: 2,
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

  req.logIn(user, async (err) => {
    res.status(200).send(user);
  });
}

exports.sendVerificationEmail = async function sendVerificationEmail(req, res) {
  const { email, name } = req.body;
  console.log("body", req.body);

  try {
    const user = await User.findOne({
      where: {
        email,
      },
      attributes: ["id"],
    });

    const verificationCode = Math.floor(Math.random() * 900000) + 100000 + "";
    const hash = await bcrypt.hash(verificationCode, saltRounds);

    if (user) {
      res.status(400).send("email already used");
      return;
    }

    console.log("-------------------- hash verification code --------------------");
    console.log(hash);

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SERVER,
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
      },
    });

    const mailOptions = {
      from: `ELCAMBA <${process.env.EMAIL}>`,
      to: email,
      subject: "Vérification de compte ELCAMBA",
      html: verificationEmailBody(name || "Mr/Mme,", verificationCode, "1 heure"),
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(info);
      res.status(200).send(hash);
    } catch (err) {
      console.log(err);
      res.status(400).send(JSON.stringify(err));
    }
  } catch (error) {
    console.error(error);
    res.status(400).send(JSON.stringify(error));
  }
};

async function getAllUsers(req, res) {
  const { limit, orderBy, order, search = "", role } = req.query;

  const options = {
    where: {
      [Op.or]: [
        {
          username: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          email: {
            [Op.like]: `%${search}%`,
          },
        },
      ],
    },
    limit: Number(limit) >= 1 ? Number(limit) : undefined,
    attributes: {
      exclude: ["password"],
    },
  };

  if (Number(search) >= 1) {
    options.where[Op.or].push({
      id: Number(search),
    });
  }

  if (Number(role) >= 1 && Number(role) <= 5) {
    options.where.accessId = Number(role);
  }

  if (orderBy) {
    options.order = [[]];
    if (orderBy === "username") options.order[0][0] = "username";
    else if (orderBy === "createdAt") options.order[0][0] = "createdAt";
    else options.order[0][0] = "id";

    if (order === "asc") options.order[0][1] = "asc";
    else options.order[0][1] = "desc";
  }

  console.log("-------------------- options --------------------");
  console.log(options);

  try {
    const result = await User.findAll(options);
    res.status(200).send(result);
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
}

async function getById(req, res) {
  const result = await User.findByPk(req.query.id, { attributes: { exclude: ["password"] } });
  res.status(200).send(result);
}

exports.updateRole = async function updateRole(req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).send("not authorized");
    return;
  }

  const user = req.user;

  try {
    const userToEdit = (await User.findByPk(req.body.id)).toJSON();

    if (userToEdit.accessId >= user.accessId || user.accessId <= req.body.role) {
      res.status(400).send("not authorized");
      return;
    }

    const { id, role } = req.body;

    await User.update(
      {
        accessId: role,
      },
      {
        where: {
          id: id,
        },
      }
    );

    const userData = (await User.findByPk(id, { attributes: { exclude: ["password"] } })).toJSON();

    res.send(userData);
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

exports.toggleStatus = async function (req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).send("not authorized");
    return;
  }

  const user = req.user;

  try {
    const userToEdit = (await User.findByPk(req.body.id)).toJSON();

    if (userToEdit.accessId >= user.accessId || user.accessId <= req.body.role) {
      res.status(400).send("not authorized");
      return;
    }

    const { id } = req.body;

    await User.update(
      { active: !userToEdit.active },
      {
        where: {
          id,
        },
      }
    );

    const userData = (await User.findByPk(id, { attributes: { exclude: ["password"] } })).toJSON();

    res.send(userData);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.updateInfo = async function updateInfo(req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).send("not authorized");
    return;
  }

  const user = req.user;

  try {
    const { username, city, address, phone } = req.body;

    console.log("-------------------- req.body --------------------");
    console.log(req.body);

    await User.update(
      {
        username,
        city,
        address,
        phone,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    const userData = (await User.findByPk(user.id)).toJSON();

    req.logIn(userData, (err) => {
      if (err) {
        res.status(400).send(err);
        return;
      }
      delete userData.password;
      res.send(userData);
    });
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

function removeFile(file) {
  return fse.remove("./public/uploads/profile-pictures/" + file);
}

async function uploadFile(file) {
  const oldPath = file.filepath;
  const ext = file.originalFilename.slice(file.originalFilename.lastIndexOf("."));
  const newName = uuidv4().replaceAll("-", "").toString() + ext;
  const newPath = "./public/uploads/profile-pictures/" + newName;
  try {
    console.log("-------------------- file.mimetype --------------------");
    console.log(file.mimetype);
    if (file.mimetype.endsWith("gif") || file.mimetype.includes("svg")) {
      await fse.move(oldPath, newPath);
    } else if (file.mimetype.endsWith("png")) {
      await sharp(oldPath)
        .resize({
          width: 300,
        })
        .flatten({ background: "white" })
        .jpeg({ mozjpeg: true, force: true })
        .toFile(newPath);
    } else {
      await sharp(oldPath)
        .resize({
          width: 300,
        })
        .jpeg({ mozjpeg: true, force: true })
        .toFile(newPath);
    }
    console.log(newName);
    return newName;
  } catch (err) {
    throw err;
  }
}

exports.updatePicture = async function updatePicture(req, res) {
  if (!req.isAuthenticated()) {
    res.status(400).send("not authorized");
    return;
  }

  const user = req.user;

  var form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, async function (err, fields, files) {
    if (err) {
      res.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
      res.end(String(err));
      return;
    }
    try {
      const picture = Object.values(files)[0];

      if (user.picture) {
        await removeFile(user.picture);
      }

      var pictureName = picture ? await uploadFile(picture) : null;

      console.log("-------------------- pictureName --------------------");
      console.log(pictureName);

      await User.update(
        { picture: pictureName },
        {
          where: {
            id: user.id,
          },
        }
      );

      const userData = (await User.findByPk(user.id)).toJSON();

      req.logIn(userData, (err) => {
        if (err) {
          res.status(400).send(err);
          return;
        }
        delete userData.password;
        res.status(200).send(userData);
      });
    } catch (err) {
      res.status(400).send(err);
      console.log(err);
    }
  });
};

async function deleteUserById(req, res) {
  db.User.deleteOne(req.params.id, (data) => {
    res.status(200).json(data);
  });
}

async function sendResetEmail(req, res) {
  const { email } = req.body;
  console.log("body", req.body);

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).send("user not found");
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpires = Date.now() + 3600000 * 2; // 1 hour from now
    console.log(resetTokenExpires);

    await User.update(
      {
        resetToken,
        resetTokenExpires,
      },
      { where: { email } }
    );

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SERVER,
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
      },
    });

    const mailOptions = {
      from: `ELCAMBA <${process.env.EMAIL}>`,
      to: email,
      subject: "Réintialisation de mot de passe ELCAMBA",
      html: emailBody(user.username, `${process.env.FRONTEND_URL}/reset-password/${resetToken}`, "1 heure"),
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(info);
      res.status(200).send("sent");
    } catch (err) {
      console.log(err);
      res.status(400).send(JSON.stringify(err));
    }
  } catch (error) {
    console.error(error);
    res.status(400).send(JSON.stringify(error));
  }
}

async function resetPassword(req, res) {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      res.status(400).json("invalid or expired token");
      return;
    }

    const hash = await bcrypt.hash(password, saltRounds);

    user.password = hash;
    user.resetToken = null;
    user.resetTokenExpires = null;

    await user.save();

    req.logout();

    console.log(user);

    res.status(200).send("success");
  } catch (error) {
    console.error(error);
    res.status(400).send(JSON.stringify(error));
  }
}

module.exports = {
  ...module.exports,
  create,
  getAllUsers,
  getById,
  deleteUserById,
  sendResetEmail,
  resetPassword,
};

function emailBody(name, link, expiration) {
  return `
  <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Réinitialisation de votre mot de passe ELCAMBA</title>
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 16px;
        line-height: 1.5;
        color: #333;
        padding: 20px;
      }
      h1{
        font-size:32px;
        font-weight:bold;
        color:#dc2626;
        text-align:center;
        border-bottom:1px solid #e2e8f0;
        padding-bottom:10px;
        margin:0;
        margin-bottom:20px;
        
      }
      h2 {
        font-size: 20px;
        font-weight: bold;
        margin-top: 40px;
        margin-bottom: 20px;
      }
      p {
        margin-top: 0;
        margin-bottom: 20px;
      }
      p:first-of-type{
        text-transform: capitalize;
      }
      a {
        display:block;
        width:fit-content;
        color: #648415 !important;
        background-color: #a5da24;
        text-decoration: none;
        padding: 10px 20px;
        border-radius: 5px;
        transition: background-color 150ms;
      }
      a:hover {
        background-color: #97c520;
      }
      .ps {
        font-size: 12px;
        margin-top: 20px;
      }
      .container{
        max-width:600px;
        margin:auto;
        border:1px solid #e2e8f0;
        border-radius:5px;
        padding:50px 30px;
      }
      .logo-name{
      }
      .logo-icon{
        margin-left:10px;
      }
      .logo-container{
        display:flex;
        width:fit-content;
        margin:auto;
        height:50px;

      }
    </style>
  </head>
  <body>
    <section class="container"">
        <div class="logo-container">

            <img src="${process.env.FRONTEND_URL}/logo_name.png" alt="ELCAMBA logo name" class="logo-name">
            <img src="${process.env.FRONTEND_URL}/logo_icon.png" alt="ELCAMBA logo icon" class="logo-icon">
        </div>
        <h2>Réinitialisation de mot de passe</h2>
        <p>Bonjour ${name},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe sur ELCAMBA. Pour accéder à votre compte, veuillez cliquer sur le lien ci-dessous:</p>
        <p><a href="${link}">Réinitialiser votre mot de passe</a></p>
        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
        <p>Cordialement,<br />L'équipe de ELCAMBA</p>
        <p class="ps">PS: Ce lien expirera dans ${expiration}. Veuillez le réinitialiser à nouveau si nécessaire.</p>
    </section>
  </body>
</html>
`;
}

function verificationEmailBody(name, code, expiration) {
  return `
  <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Vérification de compte ELCAMBA</title>
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 16px;
        color: #333;
        padding: 20px;
      }
      h1{
        font-size:32px;
        font-weight:bold;
        color:#dc2626;
        text-align:center;
        border-bottom:1px solid #e2e8f0;
        padding-bottom:10px;
        margin:0;
        margin-bottom:20px;
        
      }
      h2 {
        font-size: 20px;
        font-weight: bold;
        margin-top: 40px;
        margin-bottom: 20px;
      }
      p {
        margin-top: 0;
        margin-bottom: 20px;
      }
      p:first-of-type{
        text-transform: capitalize;
      }
      .code {
        width:fit-content;
        color: #648415;
        background-color: #a5da24;
        padding: 10px 20px;
        border-radius: 5px;
        transition: background-color 150ms;
        margin-inline:auto;
      }
      .code:hover {
        background-color: #97c520;
      }
      .ps {
        font-size: 12px;
        margin-top: 20px;
      }
      .container{
        max-width:600px;
        margin:auto;
        border:1px solid #e2e8f0;
        border-radius:5px;
        padding:50px 30px;
      }
      .logo-icon{
        margin-left:10px;
      }
      .logo-container{
        display:flex;
        width:fit-content;
        margin:auto;
        height:50px;

      }
    </style>
  </head>
  <body>
    <section class="container"">
        <div class="logo-container">

            <img src="${process.env.FRONTEND_URL}/logo_name.png" alt="ELCAMBA logo name" class="logo-name">
            <img src="${process.env.FRONTEND_URL}/logo_icon.png" alt="ELCAMBA logo icon" class="logo-icon">
        </div>
        <h2>Vérification de compte ELCAMBA</h2>
        <p>Bonjour ${name},</p>
        <p>Pour compléter la création de votre compte ELCAMBA, voici votre code:</p>
        <p class="code">${code}</p>
        <p>Si vous n'avez pas essayer de créer un compte, veuillez ignorer cet email.</p>
        <p>Cordialement,<br />L'équipe de ELCAMBA</p>
    </section>
  </body>
</html>
  `;
}
