import express from 'express';
import amqp from 'amqplib/callback_api.js';

const app = express();
app.use(express.json());

const PORT = 8087;
let logMessages = [];

app.listen(PORT, () => {
	console.log(`Monitor listening to port ${PORT}`);
});

amqp.connect('amqp://rabbitmq.laurira', (error, connection) => {
	if (error) {
		throw error;
	}

	const channel = connection.createChannel();

	channel.assertExchange('log', 'topic', { durable: false });
	channel.assertQueue('logQueue', { durable: false });
	channel.bindQueue('logQueue', 'log', 'monitor');

	channel.consume('logQueue', (message) => {
		const logMessage = message.content.toString();
		logMessages.push(logMessage);
	});
});

app.get('/', (request, response) => {
	console.log('log message array:', logMessages);
	response.send(logMessages);
});
