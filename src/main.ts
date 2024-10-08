import { RepositoryUrlData, UrlFileParser } from './urlFileParser.js'; // interface, class
import { Repository } from './repository.js'  // class
import { RepoStats } from './api_access.js'
import { Logger } from './logger.js'

export class Main {
  readonly urlFileParser: UrlFileParser;
  readonly GITHUB_TOKEN: any;
  logger: Logger;

  constructor() {
    this.urlFileParser = new UrlFileParser();
    this.logger = new Logger();
  }

  // Get all the repo's owners and names from the url file
  async parseUrlFile(): Promise<RepositoryUrlData[]> {
    this.logger.add(2, "Parsing URL_FILE...");
    var repositoryUrlData: RepositoryUrlData[] = [];

    repositoryUrlData = await this.urlFileParser.npmRepos();
    repositoryUrlData = repositoryUrlData.concat(this.urlFileParser.githubRepos());

    this.logger.add(2, "URL_FILE successfully parsed\n");
    return Promise.resolve(repositoryUrlData); 
  }
}

// Record when program starts
const startTime = performance.now();

// New main object
var main = new Main();
main.logger.add(2, "Start time: " + startTime + " milliseconds");

// Get repo owners and names
var urlData: RepositoryUrlData[] = [];
urlData = await main.parseUrlFile();

// Array of repository objects
var repositories: Repository[] = [];

// Set the correct url, owner, and name for each repository
var urlDataIndex: number;
for (urlDataIndex = 0; urlDataIndex < urlData.length; urlDataIndex++) {
  var newRepository = new Repository( 
    urlData[urlDataIndex].url, 
    urlData[urlDataIndex].owner, 
    urlData[urlDataIndex].name
  );
  // Calculate metrics here
  await newRepository.calculateAllMetrics();
  repositories.push(newRepository);
}
// Print out metric calculation results in NDJSON
var repositoryIndex: number;
var output: string = "";
for (repositoryIndex = 0; repositoryIndex < repositories.length; repositoryIndex++) {
  output = output.concat(repositories[repositoryIndex].jsonMetrics());
}

console.log(output);

// Record when program ends
const endTime = performance.now();
main.logger.add(2, "End time " + endTime + " milliseconds");
const runtime = (endTime - startTime)/1000; //in seconds
main.logger.add(1, `Total program run time: ${runtime} seconds`);
main.logger.add(2, `Total program run time: ${runtime} seconds`);

// Exit 
process.exit(0);
