"use strict";
require("dotenv").config();
const express = require("express");
const app = express();
const routes = require("./routes");
const fileUpload = require("express-fileupload");
const { createServer } = require("http");
const { Server } = require("socket.io");
const attachEvents = require("./controllers/socket");

const passport = require("passport");
require("./config/passportConfig")(passport); // pass passport for configuration

const session = require("express-session");
const sessionStore = require("./config/promiseConnection");

const sessionMiddleware = session({
  secret: process.env.MY_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000 * 24 * 30, // 3600000 1 hour in milliseconds. The expiration time of the cookie to set it as a persistent cookie.
    sameSite: true,
  },
});

const PORT = process.env.PORT;
const cors = require("cors");
var corsOptions = {
  credentials: true,
  origin: ["http://localhost:3000", "http://localhost:5173", "http://192.168.1.4:5173"],
};

app.use(express.json());
// app.use(fileUpload());
app.use(express.static(__dirname + "/public"));
app.use(cors(corsOptions));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
// io.use(wrap(passport.initialize()));
// io.use(wrap(passport.session()));

attachEvents(io);

// app.listen(PORT, () => console.log(`React API server listening on http://localhost:${PORT}`));

httpServer.listen(PORT, () => console.log(`React API server listening on http://localhost:${PORT}`));
