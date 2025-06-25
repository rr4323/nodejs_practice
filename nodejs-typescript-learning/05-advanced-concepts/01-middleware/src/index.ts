import express from 'express';
import { logger } from './middleware/logger';

const app = express();
const port = 3000;

// Apply the logger middleware to all routes
app.use(logger);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
