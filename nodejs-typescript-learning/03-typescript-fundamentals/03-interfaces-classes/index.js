"use strict";
// interfaces.ts
const user = {
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
    // Constructor
    constructor(name) {
        this.name = name;
    }
    // Method
    move(distanceInMeters = 0) {
        console.log(`${this.name} moved ${distanceInMeters}m.`);
    }
}
class Dog extends Animal {
    // Child class constructor
    constructor(name) {
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
