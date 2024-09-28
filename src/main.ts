import { RepositoryUrlData, UrlFileParser } from './urlFileParser.js'; // interface, class
import { Repository } from './repository.js'  // class
import { RepoStats } from './api_access.js'
import { Logger } from './logger.js'

export class Main {
  readonly urlFileParser: UrlFileParser;
  readonly GITHUB_TOKEN: string | undefined;
  logger: Logger;

  constructor() {
    this.urlFileParser = new UrlFileParser();
    this.logger = new Logger();
    this.GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  }

  // Get all the repo's owners and names from the url file
  async parseUrlFile(): Promise<RepositoryUrlData[]> {
    this.logger.add(2, "Parsing URL_FILE...");
    let repositoryUrlData: RepositoryUrlData[] = [];

    const npmRepos = await this.urlFileParser.npmRepos();
    const githubRepos = await this.urlFileParser.githubRepos();
    repositoryUrlData = repositoryUrlData.concat(npmRepos, githubRepos);

    this.logger.add(2, "URL_FILE successfully parsed\n");
    return repositoryUrlData;
  }

// Add a method to run the main logic, making it testable
async run(): Promise<string> {
  const startTime = performance.now();
  this.logger.add(2, `Start time: ${startTime} milliseconds`);

  // Get repo owners and names
  const urlData: RepositoryUrlData[] = await this.parseUrlFile();

  // Array of repository objects
  const repositories: Repository[] = [];

  // Set the correct url, owner, and name for each repository
  for (const repoData of urlData) {
    const newRepository = new Repository(
      repoData.url,
      repoData.owner,
      repoData.name
    );
    // Calculate metrics here
    await newRepository.calculateAllMetrics();
    repositories.push(newRepository);
  }

  // Print out metric calculation results in NDJSON
  let output: string = "";
  for (const repository of repositories) {
    output += repository.jsonMetrics();
  }

  console.log(output);

  // Record when program ends
  const endTime = performance.now();
  this.logger.add(2, `End time ${endTime} milliseconds`);
  const runtime = (endTime - startTime) / 1000; // in seconds
  this.logger.add(1, `Total program run time: ${runtime} seconds`);
  this.logger.add(2, `Total program run time: ${runtime} seconds`);

  // Return output for testing purposes
  return output;
}
}

// Only execute if this module is run directly
if (require.main === module) {
(async () => {
  try {
    const main = new Main();
    await main.run();
    process.exit(0);
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
})();
}