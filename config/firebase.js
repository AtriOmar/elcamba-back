const { initializeApp } = require("firebase-admin/app");
const { credential } = require("firebase-admin");

const serviceAccount = require("./service-account.json");

initializeApp({
  credential: credential.cert(serviceAccount),
});
