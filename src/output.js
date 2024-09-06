"use strict";
// Function for outputting to stdout. Pass the string you want to the function and
// it will print it to stdout
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeOutput = writeOutput;
const readline = require('node:readline');
function writeOutput(input) {
    const readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    readlineInterface.write(input);
}
