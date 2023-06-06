const conversationController = require("./conversationController");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User1");
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
            Sequelize.literal("(SELECT `createdAt` FROM `Messages` WHERE `Messages`.`conversationId` = `Conversation`.`id` ORDER BY `createdAt` DESC LIMIT 1)"),
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
          attributes: ["id", "username"],
        },
        {
          model: User,
          as: "User2",
          attributes: ["id", "username"],
        },
      ],
    });
    console.log("-------------------- sending to  --------------------");
    console.log(userId);
    io.to(userId).emit(
      "conversations",
      result.map((curr) => curr.toJSON())
    );
    console.log("-------------------- sendTitles result.toJSON() --------------------");
    console.log(result.map((curr) => curr.toJSON()));
  } catch (err) {
    console.log("sendTitles", err);
  }
}

async function onWatchSingle(socket, userId, toWatch) {
  if (!userId) {
    console.log("-------------------- userId --------------------");
    console.log(userId);
    return;
  }

  try {
    const [user, conversation] = await Promise.all([
      User.findByPk(toWatch, { attributes: ["id", "username"] }),
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
        include: {
          model: Message,
        },
      }),
    ]);

    if (!conversation.seen?.includes(userId)) {
      if (!conversation.seen) {
        conversation.set({
          seen: userId,
        });
      } else {
        conversation.set({
          seen: "both",
        });
      }
      await conversation.save();
    }

    socket.emit("messages", { user, conversation });

    if (!user) {
      return;
    }

    socket.join(makeRoom(userId, toWatch));
  } catch (err) {
    console.log(err);
  }
}

async function sendMessage(io, userId, receiver, message) {
  try {
    const [conversationRes] = await Conversation.findOrCreate({
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
      include: { model: Message, order: [["createdAt", "desc"]] },
      defaults: {
        userId1: userId,
        userId2: receiver,
        seen: userId,
      },
    });

    conversationRes.set({
      seen: userId,
    });

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

    sendTitles(io, userId);
    sendTitles(io, receiver);
    io.to(makeRoom(userId, receiver)).emit("messages", { conversation });
  } catch (err) {
    console.log("sendMessage", err);
  }
}

async function attachEvents(io) {
  io.on("connection", async (socket) => {
    console.log("--------------------socket.request.session.passport.user --------------------");
    const userId = socket.request.session?.passport?.user;
    console.log(userId);
    console.log("-------------------- connecting --------------------");

    // console.log("-------------------- socket.request.user --------------------");
    // console.log("bananaoma", socket.request.user);

    socket.join(userId);

    sendTitles(io, userId);

    socket.on("watchSingle", (toWatch) => onWatchSingle(socket, userId, toWatch));

    socket.on("message", ({ receiver, message }) => {
      console.log(receiver, message);
      sendMessage(io, userId, receiver, message);
    });

    socket.on("disconnect", () => console.log("------------------------ disconnecting"));
  });
}

module.exports = attachEvents;
