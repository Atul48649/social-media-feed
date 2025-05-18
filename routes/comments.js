const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Post = require('../models/Post');
const User = require('../models/User');

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
        const fromUser = req.user.id;

        if (!text) {
            return res.status(400).json({ error: 'Comment text required' });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' })

        const toUser = post.userId;

        const comment = await Comment.create({
            userId: fromUser,
            postId,
            text
        });

        const fromUserData = await User.findById(fromUser);

        await Notification.create({
            type: 'comment',
            fromUser,
            toUser,
            postId,
            message: `${fromUserData.username} commented on your post!`
        })

        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');

        const receiverSocketId = onlineUsers.get(toUser.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('notifyUser', {
                type: 'comment',
                fromUser,
                postId,
                message: `${fromUserData.username} commented on your post!`
            })
        }

        return res.status(201).json(comment);
    } catch (error) {
        console.log(error);
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