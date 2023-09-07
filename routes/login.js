const router = require("express").Router();
const passport = require("passport");

// '/api/login' route
router.post("/", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
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
      return res.status(200).send(user);
    });
  })(req, res, next);
});

// '/api/login/status' route
router.route("/status").get((req, res) => {
  if (req.isAuthenticated()) {
    if (!req.user.active) {
      req.logOut();
      return res.send({ user: null });
    }

    return res.status(200).json({ user: req.user });
  }
  res.status(200).json({
    // user: {
    //   accessId: 0,
    //   type: "visitor",
    //   userId: 0,
    //   username: "",
    // },
    user: null,
  });
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.FRONTEND_URL}?connected=true`,
    failureRedirect: process.env.FRONTEND_URL,
  })
);

module.exports = router;
