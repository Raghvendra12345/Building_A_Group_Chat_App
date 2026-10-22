const sequelize = require("../utils/db");

const { Sequelize, DataTypes } = require("sequelize");

const personalChat = sequelize.define("personalChat", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  messageType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "text",
  },
  mediaKey: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = personalChat;
