

const sequelize = require("../utils/db");
const { DataTypes } = require("sequelize");

const archivedChat = sequelize.define("archivedChat", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    originalMessageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = archivedChat;
