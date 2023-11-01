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
const searchRoute = require("./search");
const settingsRoute = require("./settings");
const photoRoute = require("./photo");
const { default: validate } = require("deep-email-validator");
const authenticateJwt = require("../authenticateJwt");

router.get("/photo", photoRoute);

// router.use(authenticateJwt);

// login route for Users
router.use("/login", loginRoute);

// // logout route for Users
router.use("/logout", logoutRoute);

router.use("/users", usersRoute);

router.use("/products", productsRoute);

router.use("/categories", categoriesRoute);

router.use("/sub-categories", subCategoriesRoute);

router.use("/abc", adsRoute);

router.use("/payment", paymentRoute);

router.use("/conversations", conversationRoute);

router.use("/search", searchRoute);

router.use("/settings", settingsRoute);

const { getMessaging } = require("firebase-admin/messaging");
const registrationToken =
  "c3dgO9e2TIWBqsH5xFNiXL:APA91bFpOoygxwNKGGy39SpavS2vvYEQnQ5rh4-IrgKbmfeYa1QyOtBovkfsHTpt4Li_WS4XrO4kQPfi3RDUC2l6zrQrmuoMHHxeo-H91NcAwBXau7sSW0MfCOuZchjunOrrqoBC75dA";
const axios = require("axios");
router.get("/message", async (req, res) => {
  const messaging = getMessaging();
  try {
    const message = {
      notification: {
        title: "This notification is for ahmed atri!",
        body: "You have a new message.",
      },
      android: {
        notification: {
          imageUrl: "https://back.elcamba.net/uploads/thumbnails/98cb71b64122420eb0e936afb59c9551.jpg",
        },
      },
      apns: {
        payload: {
          aps: {
            "mutable-content": 1,
          },
        },
        // fcm_options: {
        //   image: "https://back.elcamba.net/uploads/thumbnails/d096ef6b34824633acab97fedcf45cf0.png",
        // },
      },
      token: registrationToken,
    };
    // getMessaging()
    messaging
      .send(message)
      .then((response) => {
        console.log("Successfully sent message:", response);
      })
      .catch((error) => {
        console.log("-------------------- error sending message --------------------");
        console.log(error);
      });
  } catch (err) {
    console.log(err);
  }
  res.end("Good");
});

router.get("/test", async (req, res) => {
  console.log("-------------------- req.rawHeaders --------------------");
  console.log(req.rawHeaders);

  // res.send(req);
  res.send(req.rawHeaders);
});

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
