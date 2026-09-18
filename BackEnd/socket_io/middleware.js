
const userModel=require("../models/userModel")
const jwt=require("jsonwebtoken")

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) return next(new Error("Authorization token is missing"));

      const decoded = jwt.verify(token, "secretkey");

      if (!decoded) return next(new Error("Invalid or Expired Token"));
      const user = await userModel.findByPk(decoded.userId);

      if (!user) return next(new Error("User not found"));

      socket.user = user; //Attach user to object request
      next();
    } catch (err) {
      return next(new Error("Internal Server Error"));
    }
  });
};
