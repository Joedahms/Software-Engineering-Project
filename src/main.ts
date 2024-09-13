import { Repository, UrlFileParser } from './urlFileParser.js';

export class Main {
  readonly urlFileParser: UrlFileParser;

  constructor() {
    this.urlFileParser = new UrlFileParser();
    this.GrabRepoNames(); // Call the async init method
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
