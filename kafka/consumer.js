const kafka = require('../kafka/client');
const Notification = require('../models/Notification');
const User = require('../models/User');

const consumer = kafka.consumer({ groupId: 'notification-group' });

const startKafkaConsumer = async (io, onlineUsers) => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'notifications', fromBeginning: false });

    console.log('✅ Kafka Consumer connected and subscribed to topic');

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const data = JSON.parse(message.value.toString());
            console.log("🚀 Received Kafka message:", data);
            const { type, postId, toUserId, fromUserId } = data;


            const liker = await User.findById(fromUserId);
            const notificationMessage = type === 'like' ? `${liker.username} liked your post!` : `${liker.username} commented on your post!`

            console.log(notificationMessage);

            await Notification.create({
                type,
                postId,
                fromUser: fromUserId,
                toUser: toUserId,
                message: notificationMessage
            })

            const receiverSocketId = onlineUsers.get(toUserId.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('notifyUser', {
                    type,
                    fromUser: fromUserId,
                    postId,
                    message: notificationMessage
                });
            }
        }
    })
}

module.exports = startKafkaConsumer;