const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const Post = require('../models/Post');
const User = require('../models/User');
const kafkaProducer = require('../kafka/producer');

router.post('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        // Step 1: Check if already liked
        const alreadyLiked = await Like.findOne({ postId, userId });
        if (alreadyLiked) {
            return res.status(400).json({ message: 'You already liked this post.' });
        }

        // Step 2: Save the like
        const newLike = new Like({ postId, userId });
        await newLike.save();

        // Step 3: Fetch post and liker to send data to Kafka
        const post = await Post.findById(postId);
        const liker = await User.findById(userId);

        if (post && post.userId.toString() !== userId) {
            const message = `${liker.name} liked your post`;

            // Step 4: Send Kafka message
            await kafkaProducer.send({
                topic: 'notifications',
                messages: [
                    {
                        value: JSON.stringify({
                            receiverId: post.userId.toString(),
                            message,
                            type: 'like',
                        }),
                    },
                ],
            });
        }

        res.status(201).json({ message: 'Post liked.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
