const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Simulated user middleware (replace with real auth)
router.use((req, res, next) => {
    req.user = { id: '6826e348fb2474cf833f6216' };
    next();
});

// Add comment to a post
router.post('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Comment text required' });
        }
        const comment = await Comment.create({
            userId: req.user.id,
            postId,
            text
        });
        res.status(201).json(comment);
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
})

// Get all comments for a post
router.get('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ postId }).sort({ createdAt: -1 }).populate('userId', 'username email');
        return res.json({
            comments
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
})





module.exports = router;