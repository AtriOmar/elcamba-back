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
    return res.status(200).json({ user: req.user });
  }
  res.status(200).json({
    user: {
      accessId: 0,
      type: "visitor",
      userId: 0,
      username: "",
    },
  });
});

router.get("/success", (req, res) => {
  res.status(200).send(user);
});
router.get("/failure", (req, res) => {
  req.logout?.();
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `http://localhost:5173`,
    failureRedirect: "http://localhost:5173",
  })
);

module.exports = router;
