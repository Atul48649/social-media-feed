const kafka = require('./client');

const producer = kafka.producer();

const connectProducer = async () => {
    await producer.connect();
    console.log('✅ Kafka Producer connected');
}

connectProducer();

module.exports = producer;