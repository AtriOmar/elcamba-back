const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const authenticateJwt = require("../authenticateJwt");
const googleClient = new OAuth2Client();

// '/api/login' route
router.use(authenticateJwt);

router.post("/", function (req, res, next) {
  passport.authenticate("local", { session: false }, function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).send(info);
    }

    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      const token = jwt.sign({ sub: user.id }, process.env.MY_SECRET, { expiresIn: "30d" });
      console.log("-------------------- token --------------------");
      console.log(token);
      user.token = token;
      return res.status(200).send(user);
    });
  })(req, res, next);
});

// '/api/login/status' route
router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    if (!req.user.active) {
      req.logOut();
      return res.send({ user: null });
    }

    return res.status(200).json({ user: req.user });
  }

  res.status(200).json({
    user: null,
  });
});

router.post("/google-token", async (req, res) => {
  const { accessToken } = req.body;

  console.log("-------------------- accessToken --------------------");
  console.log(accessToken);

  async function verify(token) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (err) {
      console.log(err);
      throw new Error("invalid");
    }
  }
  try {
    const profile = await verify(accessToken);
    // const profile = jwt_decode(accessToken);

    console.log("-------------------- decoded --------------------");
    console.log(profile);

    const defaultUser = {
      username: profile.name,
      email: profile.email,
      password: process.env.DEFAULT_PASSWORD,
      accessId: 1,
      active: 1,
    };
    const result = await User.findOrCreate({
      where: {
        email: profile.email,
      },
      defaults: defaultUser,
    });
    const user = result[0].toJSON();

    const token = jwt.sign({ sub: user.id }, process.env.MY_SECRET, { expiresIn: "30d" });
    user.token = token;

    res.send(user);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.FRONTEND_URL}?connected=true`,
    failureRedirect: process.env.FRONTEND_URL,
  })
);

// Convert to a custom route handler
// router.get("/google/callback", (req, res) => {
//   console.log(req);

//   passport.authenticate("google", (err, user, info) => {
//     if (err) {
//       // Handle error
//       return res.redirect(process.env.FRONTEND_URL);
//     }
//     if (!user) {
//       // Handle authentication failure
//       return res.redirect(process.env.FRONTEND_URL);
//     }

//     // Handle successful authentication
//     // Redirect to success URL or send a custom response
//     // const token = jwt.sign({ sub: user.id }, process.env.MY_SECRET, { expiresIn: "30d" });
//     // console.log("-------------------- token  from google --------------------");
//     // console.log(token);
//     // user.token = token;

//     // return res.redirect(`${process.env.FRONTEND_URL}?connected=true&token=${token}`);
//     return res.redirect(`${process.env.FRONTEND_URL}?connected=true`);
//   })(req, res);
// });

module.exports = router;
