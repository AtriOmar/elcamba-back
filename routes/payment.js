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
    vendor: 2941,
    note: "Order #12",
    first_name: "Omar",
    last_name: "Atri",
    email: "atri.omar.2003@gmail.com",
    phone: "+21624246962",
    return_url: "http://localhost:5173",
    cancel_url: "http://localhost:5173",
    webhook_url: "http://localhost:5173",
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
