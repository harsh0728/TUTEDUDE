const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.get('/recommendations/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).populate('friends');
        const recommendations = await User.find({
            _id: { $nin: [...user.friends.map(f => f._id), user._id] },
        }).limit(5);
        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching recommendations' });
    }
});

module.exports = router;
