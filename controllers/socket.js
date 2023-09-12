const conversationController = require("./conversationController");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const { Op, Sequelize } = require("sequelize");

function makeRoom(user1, user2) {
  return [user1, user2].sort((a, b) => a - b).join("-");
}

function parseRoom(room) {
  return room.split("-");
}

async function sendTitles(io, userId) {
  try {
    const result = await Conversation.findAll({
      where: {
        [Op.or]: [
          {
            userId1: userId,
          },
          {
            userId2: userId,
          },
        ],
      },
      attributes: {
        include: [
          [
            Sequelize.literal("(SELECT `createdAt` FROM `messages` WHERE `messages`.`conversationId` = `Conversation`.`id` ORDER BY `createdAt` DESC LIMIT 1)"),
            "lastMessageCreatedAt",
          ],
        ],
      },
      order: [[Sequelize.literal("lastMessageCreatedAt"), "DESC"]],
      include: [
        { model: Message, attributes: ["id", "content", "createdAt", "senderId"], order: [["createdAt", "desc"]], limit: 1 },
        {
          model: User,
          as: "User1",
          attributes: ["id", "username", "picture"],
        },
        {
          model: User,
          as: "User2",
          attributes: ["id", "username", "picture"],
        },
      ],
    });
    // console.log("-------------------- sending to  --------------------");
    // console.log(userId);
    io.to(userId).emit(
      "conversations",
      result.map((curr) => curr.toJSON())
    );
    // console.log("-------------------- sendTitles result.toJSON() --------------------");
    // console.log(result.map((curr) => curr.toJSON()));
  } catch (err) {
    console.log("sendTitles", err);
  }
}

async function onWatchSingle(socket, userId, toWatch, io) {
  if (!userId) {
    console.log("-------------------- userId --------------------");
    console.log(userId);
    return;
  }

  try {
    const [user, conversation] = await Promise.all([
      User.findByPk(toWatch, { attributes: ["id", "username", "picture"] }),
      Conversation.findOne({
        where: {
          [Op.or]: [
            {
              userId1: userId,
              userId2: toWatch,
            },
            {
              userId1: toWatch,
              userId2: userId,
            },
          ],
        },
        include: [
          {
            model: Message,
            order: [["createdAt", "DESC"]],
            limit: socket.data.limit,
          },
          {
            model: User,
            as: "User1",
            attributes: ["id", "username", "picture"],
          },
          {
            model: User,
            as: "User2",
            attributes: ["id", "username", "picture"],
          },
        ],
      }),
    ]);

    if (conversation && conversation.seen !== userId + "" && conversation.seen !== "both") {
      if (!conversation.seen) {
        conversation.set({
          seen: userId + "",
        });
      } else {
        conversation.set({
          seen: "both",
        });
      }
      console.log("-------------------- conversation.toJSON() --------------------");
      console.log(conversation.toJSON());
      await conversation.save();
    }
    if (conversation) {
      sendHeader(io, userId, conversation);
      sendHeader(io, toWatch, conversation);
    }

    // var rooms = socket.adapter.rooms;
    // const room = rooms.get(makeRoom(userId, toWatch));

    // console.log("-------------------- room --------------------");
    // console.log(rooms);

    socket.emit("messages", { user, conversation });

    if (!user) {
      return;
    }

    socket.join(makeRoom(userId, toWatch));

    console.log("-------------------- io.sockets.adapter.rooms --------------------");
    console.log(io.sockets.adapter.rooms);
  } catch (err) {
    console.log(err);
  }
}

async function onUnwatchSingle(socket, userId, toWatch, io) {
  if (!userId) {
    console.log("-------------------- userId --------------------");
    console.log(userId);
    return;
  }

  try {
    socket.leave(makeRoom(userId, toWatch));
    console.log("-------------------- io.sockets.adapter.rooms --------------------");
    console.log(io.sockets.adapter.rooms);
  } catch (err) {
    console.log(err);
  }
}

async function sendHeader(io, userId, conversation) {
  const conv = JSON.parse(JSON.stringify(conversation));

  if (conv?.Messages?.length) {
    conv.Messages = conv.Messages.slice(-1);
  }

  try {
    io.to(userId).emit("conversation", conv);
  } catch (err) {
    console.log("sendTitles", err);
  }
}

async function sendMessage(io, userId, receiver, message) {
  try {
    var [conversationRes, created] = await Conversation.findOrCreate({
      where: {
        [Op.or]: [
          {
            userId1: userId,
            userId2: receiver,
          },
          {
            userId1: receiver,
            userId2: userId,
          },
        ],
      },
      include: [
        { model: Message, order: [["createdAt", "desc"]], limit: 1 },
        {
          model: User,
          as: "User1",
          attributes: ["id", "username", "picture"],
        },
        {
          model: User,
          as: "User2",
          attributes: ["id", "username", "picture"],
        },
      ],
      defaults: {
        userId1: userId,
        userId2: receiver,
        seen: userId + "",
      },
    });

    if (created) {
      conversationRes = await Conversation.findOne({
        where: {
          [Op.or]: [
            {
              userId1: userId,
              userId2: receiver,
            },
            {
              userId1: receiver,
              userId2: userId,
            },
          ],
        },
        include: [
          { model: Message, order: [["createdAt", "desc"]], limit: 1 },
          {
            model: User,
            as: "User1",
            attributes: ["id", "username", "picture"],
          },
          {
            model: User,
            as: "User2",
            attributes: ["id", "username", "picture"],
          },
        ],
      });
    }

    var rooms = io.sockets.adapter.rooms;
    const clients = rooms.get(makeRoom(userId, receiver));

    console.log("-------------------- room --------------------");
    console.log(clients);

    if (clients?.size === 2) {
      conversationRes.set({
        seen: "both",
      });
    } else {
      conversationRes.set({
        seen: userId + "",
      });
    }

    const conversation = conversationRes?.toJSON();

    const [result] = await Promise.all([
      Message.create({
        conversationId: conversation.id,
        senderId: userId,
        content: message,
      }),
      conversationRes.save(),
    ]);

    if (!conversation.Messages) conversation.Messages = [];

    conversation.Messages.push(result.toJSON());

    // console.log("-------------------- client --------------------");
    // var rooms = io.sockets.adapter.rooms;
    // console.log(rooms.get(makeRoom(userId, receiver)));

    // sendTitles(io, userId);
    // sendTitles(io, receiver);
    sendHeader(io, userId, conversation);
    sendHeader(io, receiver, conversation);
    // sendHeader(io, makeRoom(receiver, userId), conversation);
    // io.to(makeRoom(userId, receiver)).emit("messages", { conversation });
    if (created) {
      console.log("sending this conversation", conversation);
      io.to(makeRoom(userId, receiver)).emit("messages", { conversation });
    } else {
      io.to(makeRoom(userId, receiver)).emit("message", conversation.Messages?.at(-1));
    }
  } catch (err) {
    console.log("sendMessage", err);
  }
}

// Conversation.destroy({
//   where: {},
// });

async function attachEvents(io) {
  io.on("connection", async (socket) => {
    console.log("--------------------socket.request.session.passport.user --------------------");
    const userId = socket.request.session?.passport?.user;
    console.log(userId);
    console.log("-------------------- connecting --------------------");

    // console.log("-------------------- socket.request.user --------------------");
    // console.log(socket.request.user);

    socket.join(userId);

    sendTitles(io, userId);

    socket.on("watchSingle", (toWatch, limit) => {
      socket.data.limit = limit;
      onWatchSingle(socket, userId, toWatch, io);
    });

    socket.on("unwatchSingle", (toWatch) => {
      onUnwatchSingle(socket, userId, toWatch, io);
    });

    socket.on("message", ({ receiver, message }) => {
      console.log(receiver, message);
      sendMessage(io, userId, receiver, message);
    });

    socket.on("disconnect", () => console.log("------------------------ disconnecting"));
  });
}

module.exports = attachEvents;
