const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Token is required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded; // Store the decoded token in the request
    next();
  });
};

// Search users
router.get("/search", verifyToken, async (req, res) => {
  const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : "";

  try {
    const users = await User.find({
      username: { $regex: searchTerm, $options: "i" }, // 'i' makes the search case-insensitive
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while searching users" });
  }
});

// Send friend requests
// router.post("/send-friend-request", verifyToken, async (req, res) => {
//   const { username } = req.body; // username of the user to send a request to
//   const currentUser = await User.findById(req.user.id);

//   const friend = await User.findOne({ username }); // Find user by username

//   // Check if the user is trying to add themselves
//   if (friend._id.toString() === currentUser._id.toString()) {
//     return res
//       .status(400)
//       .json({ error: "You can't send a friend request to yourself" });
//   }

//   // Check if the user is already in the sent requests
//   if (currentUser.sentRequests.includes(username)) {
//     return res.status(400).json({ error: "Friend request already sent" });
//   }

//   // Check if the user is already a friend
//   if (currentUser.friends.includes(username)) {
//     return res.status(400).json({ error: "Already friends" });
//   }

//   // Add the request to both users
//   currentUser.sentRequests.push(friend._id);
//   await currentUser.save();

//   friend.receivedRequests.push(req.user.id);
//   await friend.save();

//   res.json({ message: "Friend request sent successfully" });
// });

router.post("/send-friend-request", verifyToken, async (req, res) => {
  const { username } = req.body; // Username of the user to send a request to
  const currentUser = await User.findById(req.user.id);
  const friend = await User.findOne({ username });

  if (!friend) {
    return res.status(404).json({ error: "User not found" });
  }

  if (friend._id.toString() === currentUser._id.toString()) {
    return res
      .status(400)
      .json({ error: "You cannot send a friend request to yourself" });
  }

  if (
    currentUser.sentRequests.includes(friend._id) ||
    friend.receivedRequests.includes(currentUser._id)
  ) {
    return res.status(400).json({ error: "Friend request already sent" });
  }

  currentUser.sentRequests.push(friend._id);
  friend.receivedRequests.push(currentUser._id);

  await currentUser.save();
  await friend.save();

  console.log("Current User Sent Requests:", currentUser.sentRequests);
  console.log("Friend Received Requests:", friend.receivedRequests);

  res.json({ message: "Friend request sent successfully" });
});

// Accepts or Reject Friend Requests
// router.post("/respond-friend-request", verifyToken, async (req, res) => {
//   const { username, action } = req.body; // `action` can be "accept" or "reject"

//   // Find the user by username
//   const sender = await User.findOne({ username });
//   if (!sender) {
//     return res.status(404).json({ error: "User not found" });
//   }

//   const userId = sender._id; // Get the userId from the sender
//   const currentUser = await User.findById(req.user.id);

//   // Ensure the request exists
//   if (!currentUser.receivedRequests.includes(userId.toString())) {
//     return res.status(400).json({ error: "No such friend request found" });
//   }

//   // Remove the request from the arrays
//   currentUser.receivedRequests = currentUser.receivedRequests.filter(
//     (id) => id.toString() !== userId.toString()
//   );

//   sender.sentRequests = sender.sentRequests.filter(
//     (id) => id.toString() !== req.user.id
//   );

//   if (action === "accept") {
//     // Add each other to the friends array
//     currentUser.friends.push(userId);
//     sender.friends.push(req.user.id);

//     await sender.save();
//     await currentUser.save();

//     return res.json({ message: "Friend request accepted" });
//   }

//   // Save changes for reject action
//   await sender.save();
//   await currentUser.save();

//   res.json({ message: "Friend request rejected" });
// });

router.post("/respond-friend-request", verifyToken, async (req, res) => {
  const { username, action } = req.body; // `action` can be "accept" or "reject"

  // Find the user by username
  const sender = await User.findOne({ username });
  if (!sender) {
    return res.status(404).json({ error: "User not found" });
  }

  const userId = sender._id.toString(); // Convert ObjectId to string
  const currentUser = await User.findById(req.user.id);

  console.log("Received Requests:", currentUser.receivedRequests);
  console.log("User ID to Match:", userId);

  // Ensure the request exists
  if (
    !currentUser.receivedRequests.map((id) => id.toString()).includes(userId)
  ) {
    return res.status(400).json({ error: "No such friend request found" });
  }

  // Remove the request from the arrays
  currentUser.receivedRequests = currentUser.receivedRequests.filter(
    (id) => id.toString() !== userId
  );

  sender.sentRequests = sender.sentRequests.filter(
    (id) => id.toString() !== req.user.id.toString()
  );

  if (action === "accept") {
    // Add each other to the friends array
    currentUser.friends.push(userId);
    sender.friends.push(req.user.id);

    await sender.save();
    await currentUser.save();

    return res.json({ message: "Friend request accepted" });
  }

  // Save changes for reject action
  await sender.save();
  await currentUser.save();

  res.json({ message: "Friend request rejected" });
});

// Friend recommendations based on mutual friends
router.get("/recommendations", verifyToken, async (req, res) => {
  const currentUser = await User.findById(req.user.id).populate("friends");

  const recommendedUsers = await User.find({
    _id: { $ne: req.user.id },
  }).populate("friends");

  const recommendations = recommendedUsers.filter((user) => {
    const mutualFriends = user.friends.filter((friend) =>
      currentUser.friends.some(
        (currentFriend) =>
          currentFriend._id.toString() === friend._id.toString()
      )
    );
    return mutualFriends.length > 0;
  });

  res.json(recommendations);
});

module.exports = router;
