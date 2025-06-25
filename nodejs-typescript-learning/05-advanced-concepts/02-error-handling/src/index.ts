import express from 'express';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Visit /error to test the error handler.');
});

// This route will intentionally throw an error
app.get('/error', (req, res, next) => {
  // In a real app, this error might come from a database operation, an external API call, etc.
  const err = new Error('This is a simulated error!');
  next(err); // Pass the error to our error handler
});

// The error-handling middleware must be defined last, after all other app.use() and routes.
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
