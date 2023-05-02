const router = require("express").Router();

const usersRoute = require("./api/users");
const loginRoute = require("./api/login");
const logoutRoute = require("./api/logout");
const productsRoute = require("./api/products");
const categoriesRoute = require("./api/categories");
const subCategoriesRoute = require("./api/subCategories");
const adsRoute = require("./api/ads");

// login route for Users
router.use("/login", loginRoute);

// // logout route for Users
router.use("/logout", logoutRoute);

router.use("/users", usersRoute);

router.use("/products", productsRoute);

router.use("/categories", categoriesRoute);

router.use("/sub-categories", subCategoriesRoute);

router.use("/ads", adsRoute);

// =========== SEND REACT PRODUCTION BUILD ====================
router.get("*", (req, res) => {
  res.status(404).send("Route not found");
});

module.exports = router;
