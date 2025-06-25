// Basic Types

// string
let message: string = 'Hello, World';
console.log(message);

// number
let score: number = 95;
let pi: number = 3.14;
console.log(`Score: ${score}, Pi: ${pi}`);

// boolean
let isLoggedIn: boolean = true;
console.log(`Is logged in: ${isLoggedIn}`);

// array
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ['Alice', 'Bob', 'Charlie'];
console.log(`Numbers: ${numbers}`);
console.log(`Names: ${names}`);

// any
let anything: any = 42;
console.log(`Anything (as number): ${anything}`);
anything = 'a string';
console.log(`Anything (as string): ${anything}`);
anything = false;
console.log(`Anything (as boolean): ${anything}`);

// null & undefined
let u: undefined = undefined;
let n: null = null;
console.log(`Undefined: ${u}, Null: ${n}`);
