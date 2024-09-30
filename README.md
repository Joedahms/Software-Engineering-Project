# Software-Engineering-Project (CSCI45000 + ECE46100) 

## Project team members

Joe Dahms  
Geromy Cunningham  
Logan Pelkey  
Djamel Almabouada  
Juan Cortes-Vicens  
Jonah Salyers  

To run the app properly, add your GitHub token to the $GITHUB_TOKEN environmental variable  
In a CLI this can be done with $ export GITHUB_TOKEN=\<Your Github Token\>

## Usage

### ./run install
This installs all NPM packages necessary to run the program on your system  
This must be done before running test or URL_FILE!!  

### ./run test
Runs the test suite
Will calculate the line coverage and the amount of tests ran and passed.

### ./run URL_FILE
This command runs the main functionality of the program. It will calculate metrics for each URL  
in the passed URL_FILE.
