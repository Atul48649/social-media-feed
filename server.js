const express = require('express');
const path = require('node:path');
const http = require('node:http');
const dotenv = require('dotenv');
const { Server } = require('socket.io')
const connectDB = require('./config/db');
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 5000;

// Store connected users and their socket IDs
const onlineUsers = new Map();

connectDB();
app.use(express.json());

// Attach to req so we can access in controllers
app.set('io', io);
app.set('onlineUsers', onlineUsers);

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // When a user comes online and sends their userId
    socket.on('addUser', (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
        for (let [uid, sid] of onlineUsers) {
            if (sid === socket.id) {
                onlineUsers.delete(uid);
                break;
            }
        }
        console.log('Client disconnected:', socket.id);
    })
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/posts', require('./routes/posts'));
app.use('/likes', require('./routes/likes'));
app.use('/comments', require('./routes/comments'));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})