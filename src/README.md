# SRC

## This folder contains all the source code we have written
***
### api_access
Contains functionality for getting stats about a repo from the GitHub API
- function fetchAllPages: Utilizes octokit.paginate to paginate the results.
- class RepoStats: Contains all the useful bits of info about a repo: prs, commits, etc...   
Also contains methods for getting the info from the API. GetRepoStats() is for calling all these   
methods from one spot.
#### Methods of RepoStats
- getLicenseName(): Checks the repo for the desired license. First checks the GitHub API endpoint.  
If that is not successful it uses regualr expressions to check the readme of the repo for the license.
- getCommitCount(): Get the total number of commits. If there is more than one page of results, it gets  
the results from that last page. If there is only one page, it uses the length of the response.
- getOpenIssues(): Gets all open issues. Does not include pull requests.
- getTotalIssues(): Gets total issues. Does not include pull requests.
- checkRateLimit(): Gets the remaining API requests and the reset time for the GitHub API. These results  
are entered into the log file.
- getRepoCreatedUpdated(): Gets the date when the repo was created as well as when it was last updated.
- getReadmeContentAndLength(): Gets the contents of the readme and its length in words.
- getRepoStats(): Calls all the methods of the class that involve requesting information about the repo  
from the API.
- handleError(): If the rate limit is hit, the program will wait until when it resets to make another  
request. If there is a real error, it will print it and exit.
***
### logger.ts
Contains the logger class.
- class Logger(): Used to clear and add to the log file.
***
### main.ts
Where the magic happens. This the entry point into the program. It is called in the run script.  
when the user enters "./run URL_FILE". The first thing that happens here is the url file that   
was passed is parsed, and the repo's URLs are pulled from it. Then for each URL found, the program   
calculates its metrics. Within this calculateAllMetrics() call, info needed from the GitHub API   
is grabbed. Once all metrics have been calculated, the output is formatted as NDJSON and is send   
to stdout.
- class Main: ?
***
### metric.ts
Contains the classes for each metric along with some functions that access the GitHub API. These  
functions could be moved elsewhere.
- abstract class Metric: Defines what each metric class looks like and what it should have. 
Has two methods, calculateValue and minMax.
- function minMax: Method of Metric. Allows for Min Max normalization of metrics to get them into   
the range of 0 to 1.
- class NetScore: Represents an overall score for the package based on all the other metrics.  
Calculated based on: License * (1 * RampUp + 1 * BusFactor + 1 * ResponsiveMaintainer)
- class RampUp: How easily it would be for developers to get acquainted with the package having  
never worked with it before.  
Calculated based on: Min Max normalized README length. Max = 27000. Min = 500.
- class Correctness: ?  
Calculated based on: NEED TO DO
- class BusFactor: How well distributed the knowledge about the package's development is.  
Calculated based on: NEED TO DO
- class ResponsiveMaintainer: How active the maintainers of the package are.  
Calculated based on:   
months = days repo has been active / 30
Min Max normalized total commits / months
Essentially a normalized value of commits / month
- class License: Whether or not the package complies with the LGPL v2.1 License.  
Calculated based on: whether or not the license can be fetched with the API or   
found in the README.
***
### output.ts
Contains one function.
- function writeOutput(string): write a string to standard out (may not need this??).
***
### repository.ts
Contains the Repository class.
- class Repository: Each URL in a URL_FILE will correspond to one Repository object. Each repository  
has an instance of each metric.  
- calculateAllMetrics(): Method in Repository that grabs necessary info with the GitHub API   
and calculates all the metrics.
- jsonMetrics(): Method on Repository that returns the metrics of the repo in NDJSON.
***
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




