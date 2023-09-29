import express from 'express';
import fs from 'fs';

const app = express();
app.use(express.json());

const PORT = 8000;
const LOGPATH = '../logs/service2.log';

// Function for writing the text to a file
const writeToFile = (text) => {
	fs.appendFile(LOGPATH, text, (error) => {
		if (error) {
			console.log(error);
		}
	});
};

// Function  for initalizing the file
const initializeLogFile = (filePath) => {
	// If the log file doesn't exist, create a new empty one
	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, '');
	} else {
		// If the file has stuff in it -> empty it
		if (fs.statSync(filePath).size > 0) {
			fs.truncateSync(filePath, 0);
		}
	}
};

// Wait for 2 seconds before running the server
setTimeout(() => {
	// Initialize the log file
	initializeLogFile(LOGPATH);

	app.listen(PORT, () => {
		console.log(`Service 2 running on port ${PORT}`);
	});

	// Route for receiving data from service 1
	app.post('/', (request, response) => {
		const data = request.body.text;

		// If we get STOP signal from s1 -> close the file and exit
		if (data === 'STOP') {
			console.log('received STOP');

			// 1s timeout so service 1 has time to exit its process
			// after 20 rounds, otherwise it will crash
			setTimeout(() => {
				console.log('Service stopped.');
				process.exit();
			}, 1000);
		} else {
			// Parse the new log text together
			const remoteAddress =
				request.headers['x-forwarded-for'] ||
				request.socket.remoteAddress;
			const text = data.replace(/\n/g, '');
			const newLogText = text + ' ' + remoteAddress + '\n';

			// Write the data to the logfile
			writeToFile(newLogText);
		}

		response.send('POST request received');
	});
}, 2000);
