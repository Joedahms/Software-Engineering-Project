# SRC

## This folder contains all the source code we have written

### output.ts

Contains one function

- function writeOutput(string): write a string to standard out (may not need this??)

### metric.ts

Contains the bulk of the code for metric calculations (formerly named test.ts)

- abstract class Metric: Defines what each metric class looks like and what it should have
  
- class NetScore: Represents an overall score for the package based on all the other metrics  
Calculated based on: ...
  
- class RampUp: How easily it would be for developers to get acquainted with the package having  
never worked with it before   
Calculated based on: ...
  
- class Correctness: ?  
Calculated based on: ...
  
- insert brief description of components here

### logger.ts

Contains the logger class

- class Logger(): Used to clear and add to the log file

### urlFileParser.ts

Contains functionality pertaining to parsing through the URLs passed though either     
a URL_FILE command line argument or the test suite     

- Interface Repository: Data structure for storing Repo owners and names
- Class urlFileParser: Used to parse the given URL file and give back owners     
and names of the repositories in the URL file.
- npmRepos(): Method of urlFileParser to extract the repo owner and name from the NPM     
links in the URL_FILE
- githubRepos(): Method of urlFileParser to extract the repo owner and name from the      
GitHub links in the URL_FILE

Both npmRepos() and githubRepos() return the owners and names as an array of Repository interfaces



