// interfaces.ts

interface User {
  id: number;
  name: string;
  isPremium?: boolean; // Optional property
  greet(): void;       // Method
}

const user: User = {
  id: 1,
  name: 'Alice',
  greet() {
    console.log(`Hello, my name is ${this.name}.`);
  },
};

console.log('--- Interface Example ---');
user.greet();

// classes.ts

class Animal {
  // Properties
  name: string;

  // Constructor
  constructor(name: string) {
    this.name = name;
  }

  // Method
  move(distanceInMeters: number = 0) {
    console.log(`${this.name} moved ${distanceInMeters}m.`);
  }
}

class Dog extends Animal {
  // Child class constructor
  constructor(name: string) {
    super(name); // Call the parent constructor
  }

  // Method override
  move(distanceInMeters = 5) {
    console.log('Running...');
    super.move(distanceInMeters);
  }
}

console.log('\n--- Class Example ---');
const myDog = new Dog('Buddy');
myDog.move(10);
