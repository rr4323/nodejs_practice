import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory data store
interface User {
  id: number;
  name: string;
}

let users: User[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];
let nextId = 3;

// --- Routes ---

// GET /users - Get all users
app.get('/users', (req: Request, res: Response) => {
  res.json(users);
});

// GET /users/:id - Get a user by ID
app.get('/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === id);

  if (user) {
    res.json(user);
  } else {
    res.status(404).send('User not found');
  }
});

// POST /users - Create a new user
app.post('/users', (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).send('User name is required');
  }

  const newUser: User = {
    id: nextId++,
    name,
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
