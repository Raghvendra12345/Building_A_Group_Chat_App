const chat = require("./chatModel");
const user = require("./userModel");
const archivedChat = require("./archivedChatModel");

user.hasMany(chat, {
  foreignKey: "userId",
});

chat.belongsTo(user, {
  foreignKey: "userId",
});

// Archived group messages
user.hasMany(archivedChat, {
  foreignKey: "userId",
});

archivedChat.belongsTo(user, {
  foreignKey: "userId",
});

module.exports = { user, chat, archivedChat };
