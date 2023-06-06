const { Model, DataTypes } = require("sequelize");

const db = require("../config/database");

const Message = db.define(
  "Message",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    content: DataTypes.TEXT,
  },

  {
    tableName: "messages",
  }
);

const Conversation = require("./Conversation");
const User = require("./User1");

Conversation.hasMany(Message, { foreignKey: "conversationId" });
Message.belongsTo(Conversation, { foreignKey: "conversationId" });

User.hasMany(Message, { foreignKey: "senderId" });
Message.belongsTo(User, { foreignKey: "senderId" });

// Message.sync({ alter: true });

module.exports = Message;
