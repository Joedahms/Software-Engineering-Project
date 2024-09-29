## This folder contains all the source code we have written

### api_access.ts
Contains functionality for getting stats about a repo from the GitHub API.
#### Functions
- function fetchAllPages(string, any = {}): Utilizes octokit.paginate to paginate the results.
#### Classes
- class RepoStats(string, string): Contains all the useful bits of info about a repo: prs, commits, etc...   
Also contains methods for getting the info from the API. GetRepoStats() is for calling all these   
methods from one spot.
##### Methods of RepoStats
- getLicenseName(string, string): Checks the repo for the desired license. First checks the GitHub API endpoint.  
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
- handleError(any): If the rate limit is hit, the program will wait until when it resets to make another  
request. If there is a real error, it will print it and exit.
***
### logger.ts
Contains the logger class.
#### Classes
- class Logger(string, number): Used to clear and add to the log file.
##### Methods of Logger
- add(number, string): Add text to the log file if the passed log level matches the current log level.
- clear(): Clear all text from the log file.
***
### main.ts
Where the magic happens. This the entry point into the program. It is called in the run script.  
When the user enters "./run URL_FILE". The first thing that happens here is the url file that   
was passed is parsed, and the repo's URLs are pulled from it. Then for each URL found, the program   
calculates its metrics. Within this calculateAllMetrics() call, info needed from the GitHub API   
is grabbed. Once all metrics have been calculated, the output is formatted as NDJSON and is sent   
to stdout.
#### Classes
- class Main(): Responsible for parsing the url file and providing access to the logs in main.ts.
##### Methods of Main
- parseUrlFile(): Parses the url file.
***
### metric.ts
Contains the classes for each metric. Each metric has a calculateValue() method which calculates its value. These  
methods are described with the equation associated with each class.
#### Classes
- abstract class Metric(string, string): Defines what each metric class looks like and what it should have.
- class NetScore(string, string): Represents an overall score for the package based on all the other metrics.  
Is automatically 0 if the license is 0.
Equation: License * (1 * RampUp + 1*Correctness + 1 * BusFactor + 1 * ResponsiveMaintainer)
- class RampUp(string, string): How easily it would be for developers to get acquainted with the package having  
never worked with it before.  
Equation: Min Max normalized README length. Max = 27000. Min = 500.
- class Correctness(string, string):
Equation: NEED TO DO
- class BusFactor(string, string): How well distributed the knowledge about the package's development is.  
Equation: It is calculated by grabbing the total contributors, and sorting them in decreasing order by number of  
commits. Then it goes through and sums the number of commits, starting with the biggest contributor, and stops  
once 50% of the total commits have been reached. This is the BusFactor. The score is normalized between 40% of  
the team size (total contributors), and 1. If the BusFactor is greater than 40% of the team size, the score given  
is one, if the BusFactor is somehow less than one then it is an error,  
else the value is normalized and returned normally.
- class ResponsiveMaintainer(string, string): How active the maintainers of the package are.  
Equation:   
months = days repo has been active / 30
Min Max normalized total commits / months
Essentially a normalized value of commits / month
- class License(string, string): Whether or not the package complies with the LGPL v2.1 License.  
Equation: whether or not the license can be fetched with the API or found in the README.
##### Methods of Metric
- minMax(number, number, number): Calculates the min max normalization of a value given the upper and lower   
bounds. Used to normalize the metrics to values between 0 and 1.

***
### repository.ts
Contains the Repository class.
#### Classes
- class Repository(string, string, string): Each URL in a URL_FILE will correspond to one Repository object. Each repository  
has an instance of each metric.  
##### Methods of Repository
- calculateAllMetrics(): Grabs necessary info with the GitHub API and calculates all the metrics.
- jsonMetrics(): Formats the metrics of each repo into NDJSON form.
***
### urlFileParser.ts
Contains functionality pertaining to parsing through the URLs passed though either     
a URL_FILE command line argument or the test suite.
#### Interfaces
- RepositoryUrlData: Data structure for storing a repo's URL, owner, and name.
#### Classes
- Class UrlFileParser(): Used to parse the given URL file and give back URLs, owners,     
and names of the repositories in the URL file.
##### Methods of UrlFileParser
- allUrlFileContents(): Simple function to get the string contents of the url file
- ownerAndNameFromUrl(Array<string>, Array<string>): Extracts the owner and name from a URL. The original URL is passed to it  
so that the URL can be added to the returned RepositoryUrlData interface.
- getNpmRepoPage(string): Gets the HTML text of an NPM package web page.
- npmRepos(): Extracts the repo URL, owner, and name from the NPM links in the URL_FILE. Utilizes webscraping  
to find the GitHub URL within the NPM page. Once the GitHub URL has been found, the owner and name are extracted from it.
- githubRepos(): Extracts the repo URL, owner, and name from the GitHub links in the URL_FILE.
