// Function for outputting to stdout. Pass the string you want to the function and
// it will print it to stdout
const readline = require('node:readline');
export function writeOutput(input) {
    const readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    readlineInterface.write(input);
}
