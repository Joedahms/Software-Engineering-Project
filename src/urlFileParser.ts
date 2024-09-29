import * as filesystem from 'node:fs'; // Accessing the file at path URL_FILE
import * as cheerio from 'cheerio'; // DOM reading
import { Logger } from './logger.js'; // Logger interface
import { NoOpLogger } from '../test/__mocks__/NoOpLogger.js'; // Import the NoOpLogger

// Two most important pieces about a repo at this point are the owner and name
export interface RepositoryUrlData {
  url: string;
  owner: string;
  name: string;
}

export class UrlFileParser {
  logger: Logger;

  // Regular expressions for sorting URLs by source
  readonly npmRegex: RegExp;
  readonly githubRegex: RegExp;
  readonly ownerAndNameRegex: RegExp; // Regex to isolate the owner and name section of the URL
  readonly ownerRegex: RegExp; // Match the owner
  readonly nameRegex: RegExp; // Match the name
  readonly urlFileContents: string;

  constructor(logger: Logger = new NoOpLogger()) {
    this.logger = logger;
    this.logger.clear();
    this.npmRegex = new RegExp("^.*npmjs.*$", "gm");      // Matches all lines that are NPM links
    this.githubRegex = new RegExp("^.*github.*$", "gm");  // Matches all lines that are GitHub links
    
    this.ownerAndNameRegex = new RegExp("(?<=com\/).*?(?=$)", "gm"); // Matches the owner and repo name section of a URL
    this.ownerRegex = new RegExp(".*?(?=\/)", "gm");                  // Matches the owner after ownerAndRepoRegex has been run
    this.nameRegex = new RegExp("(?<=\/).*?(?=$)", "gm");            // Matches the repo name after ownerAndRepoRegex has been run

    // Get the contents of the URL_FILE argument into a string
    const urlFile: string = process.argv[2];
    var urlFileContentBuffer: Buffer;
    urlFileContentBuffer = filesystem.readFileSync(urlFile);
    this.urlFileContents = urlFileContentBuffer.toString('utf8');
  }

  allUrlFileContents(): string {
    return this.urlFileContents;
  }

  #ownerAndNameFromUrl(originalUrlArray: Array<string>, githubUrlArray: Array<string>): RepositoryUrlData[] {
    var repoArray: Array<RepositoryUrlData> = [];  // Array of RepositoryUrlData interfaces that will be returned

    // Loop through all URLs
    var urlIndex: number = 0;
    for (urlIndex = 0; urlIndex < githubUrlArray.length; urlIndex++) {
      const ownerAndName = githubUrlArray[urlIndex].match(this.ownerAndNameRegex);  // Match the owner and repo section of the URL

      if (ownerAndName !== null) {  // If regex was successful
        const ownerMatch = ownerAndName[0].match(this.ownerRegex); // Match the repo owner
        const nameMatch = ownerAndName[0].match(this.nameRegex);   // Match the repo name

        if (ownerMatch !== null && nameMatch !== null) {          // If both regexs successful
          var newRepositoryUrlDataOwner = ownerMatch[0];
          var newRepositoryUrlDataName = nameMatch[0];
          const newRepositoryUrlData: RepositoryUrlData = {
            url: originalUrlArray[urlIndex],
            owner: newRepositoryUrlDataOwner,
            name: newRepositoryUrlDataName,
          }

          repoArray.push(newRepositoryUrlData);
        }
        else {
          this.logger.add(2, "Error: Regex failed on " + ownerAndName[0]);
        }
      }
      else {
        this.logger.add(2, "Error: ownerAndName regex failed on " + githubUrlArray[urlIndex]);
      }
    }
    return repoArray;
  }

  // Get the HTML text of a NPM package webpage
  async #getNpmRepoPage(npmUrl: string): Promise<string> {
    const npmUrlResponse = await fetch(npmUrl);     // Fetch request to the NPM page
    const npmUrlText = await npmUrlResponse.text(); // Get the HTML as one string
    return npmUrlText;
  }

  async npmRepos(): Promise<RepositoryUrlData[]> {
    this.logger.add(2, "Searching for NPM URLs in URL_FILE");
    const npmUrlArray = this.urlFileContents.match(this.npmRegex);  // Get the NPM URLs from the passed URL_FILE
    var repoArray: Array<RepositoryUrlData> = [];  // Array of repo owner and names to return

    if (npmUrlArray !== null) { // If there are some NPM URLs in the URL_FILE
      const totalNpmUrls = npmUrlArray.length;  
     
      // Add info to log file
      this.logger.add(2, totalNpmUrls + " NPM URLs found");
      this.logger.add(2, "NPM URLs: " + String(npmUrlArray));

      var githubUrlArray: Array<string> = []; // Array of GitHub URLs extracted from the NPM pages
      var npmUrlIndex: number;
      for (npmUrlIndex = 0; npmUrlIndex < totalNpmUrls; npmUrlIndex++) {
        try {
          const npmUrlText = await this.#getNpmRepoPage(npmUrlArray[npmUrlIndex]); // Get the HTML of the page

          const $ = cheerio.load(npmUrlText); // Load HTML into cheerio object

          const githubUrlDiv = $.extract({    // Extract the div containing the GitHub URL 
            class: ['._702d723c'],
          });

          githubUrlArray.push(githubUrlDiv.class[0]); // Add the GitHub URL to the array
        }
        catch (error) {
          console.log(error.message);
          throw(error);
        }
      }
      repoArray = this.#ownerAndNameFromUrl(npmUrlArray, githubUrlArray);
      this.logger.add(2, "Successfully searched for NPM URLs in URL_FILE");
      return Promise.resolve(repoArray);
    }
    else {  // No NPM URLs in the URL_FILE
      this.logger.add(1, "No NPM URLs in passed file");
      return Promise.resolve(repoArray); // Empty repo array
    }
  }

  githubRepos(): RepositoryUrlData[] {
    this.logger.add(2, "Searching for GitHub URLs from URL_FILE...");
    const githubUrlArray = this.urlFileContents.match(this.githubRegex);  // Match all the github URLs in the url file
    var githubRepoArray: Array<RepositoryUrlData> = [];  // Array of RepositoryUrlData interfaces that will be returned

    if (githubUrlArray !== null) {  // Check if any GitHub urls are in the URL_FILE
      const totalGithubUrls = githubUrlArray.length;

      // Add info to log file
      this.logger.add(2, totalGithubUrls + " GitHub URLs found");
      this.logger.add(2, "GitHub URLs: " + String(githubUrlArray));

      githubRepoArray = this.#ownerAndNameFromUrl(githubUrlArray, githubUrlArray);
    }
    else {
      this.logger.add(2, "No GitHub URLs in passed URL_FILE");
    }
    this.logger.add(2, "Successfully searched for GitHub URLs in URL_FILE");
    return githubRepoArray;
  }
}