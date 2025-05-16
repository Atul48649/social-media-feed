const express = require('express');
const router = express.Router();
const multer = require('multer');
const Post = require('../models/Post');
const User = require('../models/User');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Simulated user middleware (replace with real auth)
router.use((req, res, next) => {
    req.user = { id: '6826e348fb2474cf833f6216' };
    next();
});


router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        console.log(req.user);
        const { text } = req.body;
        console.log("req.body", req.body);
        const images = req.files ? req.files.map(f => f.filename) : [];
        console.log('images', images);
        const post = await Post.create({
            userId: req.user.id,
            text,
            images
        })
        return res.status(201).json({
            post
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
})

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate('userId', 'username');
        return res.json({
            posts
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
})

router.post('/:id/report', async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ error: 'Report reason required' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(400).json({ error: 'Post not found' });
        }

        post.reports.push({ userId: req.user.id, reason });
        await post.save();
        return res.json({ message: 'Post reported' });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
})




module.exports = router;