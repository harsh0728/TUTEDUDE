const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// Exclude the password field when converting the document to JSON
// UserSchema.set("toJSON", {
//   transform: (doc, ret) => {
//     delete ret.password;
//     return ret;
//   },
// });

const User = mongoose.model("User", UserSchema);
module.exports = User;
