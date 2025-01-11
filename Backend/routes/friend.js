const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/friend-request', async (req, res) => {
    const { senderId, receiverId } = req.body;
    try {
        const receiver = await User.findById(receiverId);
        if (!receiver.friendRequests.includes(senderId)) {
            receiver.friendRequests.push(senderId);
            await receiver.save();
            res.json({ message: 'Friend request sent' });
        } else {
            res.status(400).json({ error: 'Friend request already sent' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error sending friend request' });
    }
});

router.post('/respond-request', async (req, res) => {
    const { userId, senderId, action } = req.body;
    try {
        const user = await User.findById(userId);
        if (action === 'accept') {
            user.friends.push(senderId);
        }
        user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
        await user.save();
        res.json({ message: 'Request processed' });
    } catch (err) {
        res.status(500).json({ error: 'Error processing request' });
    }
});

module.exports = router;
