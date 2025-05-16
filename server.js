const express = require('express');
const path = require('node:path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/posts', require('./routes/posts'));
app.use('/likes', require('./routes/likes'));
app.use('/comments', require('./routes/comments'));

try {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    })
} catch (error) {
    console.log(error.message);
}
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// })
