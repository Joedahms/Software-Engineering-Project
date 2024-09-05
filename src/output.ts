const readline = require('node:readline');

export function writeOutput(input: string) {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readlineInterface.write(input);
}




