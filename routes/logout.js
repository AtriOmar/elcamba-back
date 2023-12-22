const User = require("../models/User");
const router = require("express").Router();

// Matches with "api/logout"
router.route("/").get(async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      user: null,
    });
  }

  const user = req.user;
  const regTokens = JSON.parse(user.regTokens);
  const newRegTokens = regTokens.filter((token) => token !== req.query.registrationToken);

  await User.update(
    {
      regTokens: JSON.stringify(newRegTokens),
    },
    {
      where: {
        id: user.id,
      },
    }
  );

  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.status(200).json({
      // user: {
      //   accessId: 0,
      //   type: "visitor",
      //   id: 0,
      //   username: "",
      // },
      user: null,
    });
  });
  req.logout();
});

module.exports = router;
