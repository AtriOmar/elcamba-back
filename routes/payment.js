const axios = require("axios");

const router = require("express").Router();

const headers = {
  "Content-type": "application/json",
  Authorization: `Token ${process.env.PAYMEE_TOKEN}`,
};

router.post("/createProductAd", async (req, res) => {
  const { amount } = req.body;

  const payload = {
    amount,
    vendor: process.env.PAYMEE_VENDOR,
    note: "Order",
    first_name: "ELCAMBA",
    last_name: "ELCAMBA",
    email: "elcamba@gmail.com",
    phone: "+21600000000",
    return_url: process.env.FRONTEND_URL,
    cancel_url: process.env.FRONTEND_URL,
    webhook_url: process.env.FRONTEND_URL,
  };

  try {
    const result = await axios.post("https://sandbox.paymee.tn/api/v1/payments/create", payload, { headers });

    const ad = {};
    res.send(result.data);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

module.exports = router;
