const router = require("express").Router();

const usersRoute = require("./api/users");
const loginRoute = require("./api/login");
const logoutRoute = require("./api/logout");
const productsRoute = require("./api/products");
const categoriesRoute = require("./api/categories");
const subCategoriesRoute = require("./api/subCategories");
const adsRoute = require("./api/ads");
const paymentRoute = require("./api/payment");
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
