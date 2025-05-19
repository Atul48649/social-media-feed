const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'social-media-app',
    brokers: ['localhost:9092']
});

module.exports = kafka;