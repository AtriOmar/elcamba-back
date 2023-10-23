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

require("./config/firebase");

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
const authenticateJwt = require("./authenticateJwt");
var corsOptions = {
  credentials: true,
  origin: ["http://localhost", process.env.FRONTEND_URL],
};

app.use(express.json());
// app.use(fileUpload());
app.use(express.static(__dirname + "/public"));
app.use(cors(corsOptions));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
// app.use(authenticateJwt);
app.use(routes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));
// io.use(wrap(passport.authenticate(["jwt"])));

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  console.log("-------------------- token --------------------");
  console.log(token);

  if (socket.request.user) return next();

  socket.request.headers.authorization = token;

  console.log("-------------------- socket.request.headers --------------------");
  console.log(socket.request.headers);

  console.log("-------------------- authenticating --------------------");
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err || !user) {
      console.log("-------------------- user --------------------");
      console.log(user);
      return next(new Error("Unauthorized"));
    }

    socket.request.user = user;
    return next();
  })(socket.request, socket.request.res, next);
});

attachEvents(io);

// app.listen(PORT, () => console.log(`React API server listening on http://localhost:${PORT}`));

httpServer.listen(PORT, () => console.log(`React API server listening on http://localhost:${PORT}`));
