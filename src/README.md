# SRC

## This folder contains all the source code we have written

### logger.ts
Contains the logger class.
- class Logger(): Used to clear and add to the log file.

### main.ts
Where the magic happens. This the entry point into the program. It is called in the run script.  
when the user enters "./run URL_FILE".
- class Main: ?
At the moment all that is being done in main is outputting the NDJSON for all the URLs in the passed URL_FILE.  
This was for testing purposes.

### metric.ts
Contains the classes for each metric along with some functions that access the GitHub API. These  
functions could be moved elsewhere.
- abstract class Metric: Defines what each metric class looks like and what it should have.
- class NetScore: Represents an overall score for the package based on all the other metrics.  
Calculated based on: ...
- class RampUp: How easily it would be for developers to get acquainted with the package having  
never worked with it before.  
Calculated based on: ...
- class Correctness: ?  
Calculated based on: ...
- class BusFactor: How well distributed the knowledge about the package's development is.  
Calculated based on: ...
- class ResponsiveMaintainer: How active the maintainers of the package are.  
Calculated based on: ...
- class License: Whether or not the package complies with the LGPL v2.1 License.  
Calculated based on: ...

### output.ts
Contains one function.
- function writeOutput(string): write a string to standard out (may not need this??).

### repository.ts
Contains the Repository class.
- class Repository: Each URL in a URL_FILE will correspond to one Repository object. Each repository  
has an instance of each metric.  
- jsonMetrics(): Method on Repository that returns the metrics of the repo in NDJSON.

### urlFileParser.ts
Contains functionality pertaining to parsing through the URLs passed though either     
a URL_FILE command line argument or the test suite.
- Interface RepositoryUrlData: Data structure for storing a repo's URL, owner, and names.
- Class urlFileParser: Used to parse the given URL file and give back URLs, owners,     
and names of the repositories in the URL file.
- ownerAndNameFromUrl(): Method of urlFileParser that extracts the owner and name from a URL.  
The original URL is passed to it so that the URL can be added to the returned RepositoryUrlData interface.  
- npmRepos(): Method of urlFileParser to extract the repo URL, owner, and name from the NPM     
links in the URL_FILE. Utilizes webscraping to find the GitHub URL within the NPM page. Once  
the GitHub URL has been found, the owner and name are extracted from it.
- githubRepos(): Method of urlFileParser to extract the repo URL, owner, and name from the      
GitHub links in the URL_FILE.




