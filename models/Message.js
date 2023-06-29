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
const User = require("./User");

Conversation.hasMany(Message, { foreignKey: "conversationId", onDelete: "CASCADE" });
Message.belongsTo(Conversation, { foreignKey: "conversationId", onDelete: "CASCADE" });

User.hasMany(Message, { foreignKey: "senderId", onDelete: "CASCADE" });
Message.belongsTo(User, { foreignKey: "senderId", onDelete: "CASCADE" });

// Message.sync({ alter: true });

module.exports = Message;
