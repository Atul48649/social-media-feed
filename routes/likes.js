const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Like = require('../models/Like');
const User = require('../models/User');
const Notification = require('../models/Notification');

router.use((req, res, next) => {
    req.user = { id: '6826e348fb2474cf833f6216' };
    next();
});

router.post('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const alreadyLiked = await Like.findOne({
            userId,
            postId
        });
        if (alreadyLiked) {
            return res.status(400).json({ error: 'Already liked this post' });
        }

        await Like.create({
            userId,
            postId: req.params.postId
        })

        const fromUser = await User.findById(userId);

        await Notification.create({
            type: 'like',
            fromUser: userId,
            toUser: post.userId,
            postId,
            message: `${fromUser.username} liked your post!`
        })

        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');
        const receiverSocketId = onlineUsers.get(post.userId.toString());

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('notifyUser', {
                type: 'like',
                fromUser: userId,
                postId,
                message: `${fromUser.username} liked your post!`
            });
        }

        res.status(200).json({ message: 'Post liked and user notified' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message
        })
    }
})

router.delete('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const result = await Like.findOneAndDelete({
            userId: req.user.id,
            postId
        })
        if (!result) {
            return res.status(404).json({ error: 'Like not found' });
        }
        res.json({ message: 'Post unliked' });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
})

router.get('/:postId/count', async (req, res) => {
    try {
        const { postId } = req.params;
        const count = await Like.countDocuments({ postId });
        return res.json({
            postId,
            likesCount: count
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
})

module.exports = router;