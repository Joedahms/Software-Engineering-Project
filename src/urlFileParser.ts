import * as filesystem from 'node:fs' // Accessing the file at path URL_FILE

// Make sure the path is the root
var parentDirectory: string = "../";      // Parent directory
const urlFile: string = process.argv[2];    // Name of url file
parentDirectory = parentDirectory.concat(urlFile);      // Actual path of the url file



/*
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

*/
