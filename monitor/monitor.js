import express from 'express';
import amqp from 'amqplib/callback_api.js';

const app = express();
app.use(express.json());

const PORT = 8087;

app.listen(PORT, () => {
	console.log(`monitor listening to port ${PORT}`);
});

app.get('/ping', (request, response) => {
	response.send('pong');
});
