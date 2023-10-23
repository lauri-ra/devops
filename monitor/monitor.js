import express from 'express';
import amqp from 'amqplib/callback_api.js';

const app = express();
app.use(express.json());

const PORT = 8087;
let logMessages = [];
let channel;

app.listen(PORT, () => {
	console.log(`Monitor listening to port ${PORT}`);
});

amqp.connect('amqp://rabbitmq.laurira', (error, connection) => {
	if (error) {
		throw error;
	}

	channel = connection.createChannel();

	// Assert exchange and bind a queue to it
	channel.assertExchange('log', 'topic', { durable: false });
	channel.assertQueue('logQueue', { durable: false });
	channel.bindQueue('logQueue', 'log', 'monitor');

	// Listen for topic "log"
	channel.consume('logQueue', (message) => {
		const logMessage = message.content.toString();
		logMessages.push(logMessage);
	});
});

app.get('/', (request, response) => {
	response.setHeader('Content-Type', 'text/plain');
	response.send(logMessages.join('\n'));
});

// Close the connection & exit on command
process.on('SIGTERM', () => {
	channel.close();
	process.exit(0);
});
