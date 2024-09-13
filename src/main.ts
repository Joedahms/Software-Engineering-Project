import { RepositoryUrlData, UrlFileParser } from './urlFileParser.js';
import { ndjsonTest } from './metric.js'
import { Repository } from './repository.js'

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

var main = new Main();

var urlData: RepositoryUrlData[] = [];
urlData = await main.parseUrlFile();

var repositories: Repository[] = [];

var urlDataIndex: number;
for (urlDataIndex = 0; urlDataIndex < urlData.length; urlDataIndex++) {
  var newRepository = new Repository( urlData[urlDataIndex].url, 
                                      urlData[urlDataIndex].owner, 
                                      urlData[urlDataIndex].name
                                    );
  repositories.push(newRepository);
}

var repositoryIndex: number;
var output: string = "";
for (repositoryIndex = 0; repositoryIndex < repositories.length; repositoryIndex++) {
  //output = repositories[repositoryIndex].jsonMetrics().join('\n');
  output = output.concat(repositories[repositoryIndex].jsonMetrics());
}
console.log(output);

process.exit(0);

//console.log(repositories);

