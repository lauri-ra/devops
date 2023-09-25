import express from 'express';

const app = express();
app.use(express.json());

const PORT = 8000;

// Test route
app.get('/ping', (request, response) => {
	response.send('pong');
});

// Route for receiving data from service 1
app.post('/', (request, response) => {
	const text = request.body.text;
	console.log('Received:', text);
	response.send('POST request received');
});

// Run the server on port 8000
app.listen(PORT, () => {
	console.log(`server running on ${PORT}`);
});
