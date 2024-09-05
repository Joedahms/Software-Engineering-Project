"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeOutput = writeOutput;
var readline = require('node:readline');
function writeOutput(input) {
    var readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    readlineInterface.write(input);
}
