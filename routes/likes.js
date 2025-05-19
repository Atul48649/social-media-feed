const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Like = require('../models/Like');
const kafkaProducer = require('../kafka/producer');

router.use((req, res, next) => {
    req.user = { id: '6826e348fb2474cf833f6216' };
    next();
});

router.post('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const fromUserId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const toUserId = post.userId;

        const alreadyLiked = await Like.findOne({
            userId: fromUserId,
            postId
        });
        if (alreadyLiked) return res.status(400).json({ error: 'Already liked this post' });

        await Like.create({
            userId: fromUserId,
            postId
        })

        await kafkaProducer.send({
            topic: 'notifications',
            messages: [
                {
                    value: JSON.stringify({
                        type: 'like',
                        postId,
                        toUserId,
                        fromUserId,
                    })
                }
            ]
        })
        res.status(200).json({ message: 'Post liked' });
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