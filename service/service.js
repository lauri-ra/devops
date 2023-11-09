import express from 'express';

const app = express();
app.use(express.json());

const PORT = 3001;

app.listen(PORT, () => {
	console.log(`target service running on port ${PORT}`);
});
