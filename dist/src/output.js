// Function for outputting to stdout. Pass the string you want to the function and
// it will print it to stdout
import * as readline from 'node:readline';
export function writeOutput(input) {
    const readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    readlineInterface.write(input + '\n');
}
