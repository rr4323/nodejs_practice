import express from 'express';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = 3000;

// Middleware for parsing JSON
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);

// Centralized Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
