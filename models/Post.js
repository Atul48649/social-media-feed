const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String
    },
    images: {
        type: [String]
    },
    reports: [ReportSchema]
}, {
    timestamps: true
})

module.exports = mongoose.model('Post', PostSchema);