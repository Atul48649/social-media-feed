const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['like', 'comment'],
            required: true,
        },
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        toUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        message: String,
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
