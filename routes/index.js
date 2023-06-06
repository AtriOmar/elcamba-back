const router = require("express").Router();

const usersRoute = require("./users");
const loginRoute = require("./login");
const logoutRoute = require("./logout");
const productsRoute = require("./products");
const categoriesRoute = require("./categories");
const subCategoriesRoute = require("./subCategories");
const adsRoute = require("./ads");
const paymentRoute = require("./payment");
const conversationRoute = require("./conversations");
const { default: validate } = require("deep-email-validator");

// login route for Users
router.use("/login", loginRoute);

// // logout route for Users
router.use("/logout", logoutRoute);

router.use("/users", usersRoute);

router.use("/products", productsRoute);

router.use("/categories", categoriesRoute);

router.use("/sub-categories", subCategoriesRoute);

router.use("/ads", adsRoute);

router.use("/payment", paymentRoute);

router.use("/conversations", conversationRoute);

router.get("/verify", async (req, res) => {
  const email = req.query.email || "atri.omar.2003@gmail.com";
  try {
    const result = await validate(email);

    result.email = email;

    res.send(result);
  } catch (err) {
    res.status(400).send(JSON.stringify(err));
  }
});

// =========== SEND REACT PRODUCTION BUILD ====================
router.get("*", (req, res) => {
  res.status(404).send("Route not found");
});

module.exports = router;
