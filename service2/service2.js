import express from 'express';
import amqp from 'amqplib/callback_api.js';

const app = express();
app.use(express.json());

const PORT = 8000;

const httpHandler = (request) => {
	const data = request.body.message;

	// Get the address and port from service 1 request
	const remoteAddress =
		request.headers['x-forwarded-for'] || request.socket.remoteAddress;

	const remotePort = request.socket.remotePort;

	// Parse the new log text together
	const text = data.replace(/\n/g, '');
	const newLogText = text + ' ' + remoteAddress + ':' + remotePort + '\n';
	return newLogText;
};

// Wait for 2 seconds before running the server
setTimeout(() => {
	// Create amqp connection
	amqp.connect('amqp://localhost', (error, connection) => {
		if (error) {
			throw error;
		}

		const channel = connection.createChannel();
		console.log('created amqp connection');

		// Assert exchanges for topics "message" and "log"
		channel.assertExchange('message', 'topic', { durable: false });
		channel.assertExchange('log', 'topic', { durable: false });

		// Assert queue for topic "message"
		channel.assertQueue('msgQueue', { durable: false });
		channel.bindQueue('msgQueue', 'message', '');

		// Listen for topic "message" queue
		channel.consume('msgQueue', (message) => {
			// Parse the received text with "MSG"
			const msgContent = message.content.toString();
			const newMsg = msgContent + 'MSG';

			// Send the new text back to broker with topic "log"
			channel.publish('log', 's2.response', Buffer.from(newMsg));
		});
	});

	app.listen(PORT, () => {
		console.log(`Service 2 running on port ${PORT}`);
	});

	// Route for receiving data POST requests from serice 1
	app.post('/', (request, response) => {
		// Parse the message from the request
		const httpMsg = httpHandler(request);

		// TODO: queue for this??
		// channel.publish('log', 'topic', Buffer.from(httpMsg));
		console.log('httpMsg', httpMsg);

		response.send('POST request received');
	});
}, 2000);
