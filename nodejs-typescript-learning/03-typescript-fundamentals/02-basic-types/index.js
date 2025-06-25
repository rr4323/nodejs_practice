// Basic Types
// string
var message = 'Hello, World';
console.log(message);
// number
var score = 95;
var pi = 3.14;
console.log("Score: ".concat(score, ", Pi: ").concat(pi));
// boolean
var isLoggedIn = true;
console.log("Is logged in: ".concat(isLoggedIn));
// array
var numbers = [1, 2, 3];
var names = ['Alice', 'Bob', 'Charlie'];
console.log("Numbers: ".concat(numbers));
console.log("Names: ".concat(names));
// any
var anything = 42;
console.log("Anything (as number): ".concat(anything));
anything = 'a string';
console.log("Anything (as string): ".concat(anything));
anything = false;
console.log("Anything (as boolean): ".concat(anything));
// null & undefined
var u = undefined;
var n = null;
console.log("Undefined: ".concat(u, ", Null: ").concat(n));
