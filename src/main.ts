import { RepositoryUrlData, UrlFileParser } from './urlFileParser.js'; // interface, class
import { Repository } from './repository.js'  // class
import { writeOutput } from './output.js'     // function

export class Main {
  readonly urlFileParser: UrlFileParser;

  constructor() {
    this.urlFileParser = new UrlFileParser();
  }

  // Get all the repo's owners and names from the url file
  async parseUrlFile(): Promise<RepositoryUrlData[]> {
    var repositoryUrlData: RepositoryUrlData[] = [];

    repositoryUrlData = await this.urlFileParser.npmRepos();
    repositoryUrlData = repositoryUrlData.concat(this.urlFileParser.githubRepos());

    return Promise.resolve(repositoryUrlData); 
  }
}

// New main object
var main = new Main();

// Get repo owners and names
var urlData: RepositoryUrlData[] = [];
urlData = await main.parseUrlFile();

// Array of repository objects
var repositories: Repository[] = [];

// Set the correct url, owner, and name for each repository
var urlDataIndex: number;
for (urlDataIndex = 0; urlDataIndex < urlData.length; urlDataIndex++) {
  var newRepository = new Repository( urlData[urlDataIndex].url, 
                                      urlData[urlDataIndex].owner, 
                                      urlData[urlDataIndex].name
                                    );
  repositories.push(newRepository);
}

// Print out metric calculation results in NDJSON
// As of now, there aren't any calculations being done, defaults are printed
var repositoryIndex: number;
var output: string = "";
for (repositoryIndex = 0; repositoryIndex < repositories.length; repositoryIndex++) {
  output = output.concat(repositories[repositoryIndex].jsonMetrics());
}

//writeOutput(output);  // Cant figure out how to get the terminal caret to go away
console.log(output);

// Exit 
process.exit(0);
