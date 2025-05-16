const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Like = require('../models/Like');

router.use((req, res, next) => {
    req.user = { id: '644f345d3a7d2b0d3c123456' };
    next();
});

router.post('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const existing = await Like.findOne({
            userId: req.user.id,
            postId
        });
        if (existing) {
            res.status(400).json({ error: 'Already liked' });
        }
        await Like.create({
            userId: req.user.id,
            postId: req.params.postId
        })
        return res.status(201).json({
            message: 'Post liked'
        })
    } catch (error) {
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