import { Repository, UrlFileParser } from './urlFileParser.js';
import { fetchRepoStats } from './metric.js';



export class Main {
  readonly urlFileParser: UrlFileParser;
  readonly GITHUB_TOKEN: any;

  constructor() {
    this.urlFileParser = new UrlFileParser();
    this.GrabRepoNames(); // Call the async init method
    this.GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  }

  async GrabRepoNames() {
    // Async function to handle async calls
    var testRepo: Repository[] = [];
    testRepo = await this.urlFileParser.npmRepos();
    console.log(testRepo);
    testRepo = this.urlFileParser.githubRepos();
    console.log(testRepo);
  }
}

function main(): void {
  new Main();
}

main();
await fetchRepoStats('Joedahms', 'Software-Engineering-Project');
process.exit(0);
