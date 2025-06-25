export interface User {
  id: number;
  name: string;
  email: string;
}

let users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];
let nextId = 3;

export const getAllUsers = (): User[] => {
  return users;
};

export const getUserById = (id: number): User | undefined => {
  return users.find(user => user.id === id);
};

export const createUser = (name: string, email: string): User => {
  const newUser: User = { id: nextId++, name, email };
  users.push(newUser);
  return newUser;
};

export const updateUser = (id: number, name: string, email: string): User | undefined => {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) {
    return undefined;
  }
  const updatedUser = { ...users[userIndex], name, email };
  users[userIndex] = updatedUser;
  return updatedUser;
};

export const deleteUser = (id: number): boolean => {
  const initialLength = users.length;
  users = users.filter(user => user.id !== id);
  return users.length < initialLength;
};
