const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const kafkaProducer = require('../kafka/producer');

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
        const fromUserId = req.user.id;

        if (!text) {
            return res.status(400).json({ error: 'Comment text required' });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' })

        const toUserId = post.userId;

        const comment = await Comment.create({
            userId: fromUserId,
            postId,
            text
        });

        await kafkaProducer.send({
            topic: 'notifications',
            messages: [
                {
                    value: JSON.stringify({
                        type: 'comment',
                        postId,
                        toUserId,
                        fromUserId,
                    })
                }
            ]
        })

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