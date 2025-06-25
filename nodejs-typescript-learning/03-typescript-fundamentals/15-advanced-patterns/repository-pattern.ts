/**
 * Repository Pattern Implementation
 * 
 * The Repository Pattern mediates between the domain and data mapping layers, acting like
 * an in-memory collection of domain objects.
 */

type Id = string | number;

// Base interface for entities
interface Entity<T> {
  id: T;
  [key: string]: any;
}

// Generic Repository interface
export interface IRepository<T extends Entity<Id>> {
  getById(id: Id): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: Id, entity: Partial<T>): Promise<T | undefined>;
  delete(id: Id): Promise<boolean>;
  find(predicate: (entity: T) => boolean): Promise<T[]>;
}

// In-memory implementation of the repository
export class InMemoryRepository<T extends Entity<Id>> implements IRepository<T> {
  protected entities: Map<Id, T> = new Map();
  private idCounter: number = 1;

  async getById(id: Id): Promise<T | undefined> {
    return this.entities.get(id);
  }

  async getAll(): Promise<T[]> {
    return Array.from(this.entities.values());
  }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    const id = this.idCounter++;
    const newEntity = { ...entity, id } as T;
    this.entities.set(id, newEntity);
    return newEntity;
  }

  async update(id: Id, updates: Partial<T>): Promise<T | undefined> {
    const entity = this.entities.get(id);
    if (!entity) return undefined;
    
    const updatedEntity = { ...entity, ...updates, id };
    this.entities.set(id, updatedEntity);
    return updatedEntity;
  }

  async delete(id: Id): Promise<boolean> {
    return this.entities.delete(id);
  }

  async find(predicate: (entity: T) => boolean): Promise<T[]> {
    return Array.from(this.entities.values()).filter(predicate);
  }
}

// Example usage with a User entity
interface User extends Entity<number> {
  id: number;
  name: string;
  email: string;
  age?: number;
}

class UserRepository extends InMemoryRepository<User> {
  async findByName(name: string): Promise<User[]> {
    return this.find(user => 
      user.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const users = await this.find(user => user.email === email);
    return users[0];
  }
}

// Example usage
async function demo() {
  const userRepo = new UserRepository();
  
  // Create users
  const user1 = await userRepo.create({ 
    name: 'John Doe', 
    email: 'john@example.com',
    age: 30
  });
  
  const user2 = await userRepo.create({
    name: 'Jane Smith',
    email: 'jane@example.com'
  });

  // Find by ID
  const foundUser = await userRepo.getById(user1.id);
  console.log('Found user by ID:', foundUser);

  // Update
  await userRepo.update(user2.id, { age: 28 });
  
  // Find by name
  const johns = await userRepo.findByName('john');
  console.log('Users named John:', johns);
  
  // Get all users
  const allUsers = await userRepo.getAll();
  console.log('All users:', allUsers);
  
  // Delete
  const deleted = await userRepo.delete(user1.id);
  console.log(`User ${user1.id} deleted:`, deleted);
}

// Uncomment to run the demo
// demo();

export {
  IRepository,
  InMemoryRepository,
  UserRepository,
  User
};
