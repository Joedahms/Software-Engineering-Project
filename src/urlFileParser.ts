import * as filesystem from 'node:fs'   // Accessing the file at path URL_FILE
//import * as axios from 'axios'
import * as cheerio from 'cheerio'

import {Logger} from './logger.js'      // Logger interface
import {writeOutput} from './output.js' // writeOutput function

// Two most important pieces about a repo at this point are the owner and name
export interface Repository {
  owner: string;
  name: string;
}

export class UrlFileParser {
  logger: Logger;

  // Regular expressions for sorting urls by source
  readonly npmRegex: RegExp;
  readonly githubRegex: RegExp;

  readonly ownerAndNameRegex: RegExp; // Regex to isolate the owner and name section of the url
  readonly ownerRegex: RegExp;        // Match the owner
  readonly nameRegex: RegExp;         // Match the name

  readonly urlFileContents: string;

  constructor() {
    this.logger = new Logger();
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

  ownerAndNameFromUrl(urlArray: Array<string>): Repository[] {
    var repoArray: Array<Repository> = [];  // Array of Repository interfaces that will be returned

    // Loop through all URLs
    var urlIndex: number = 0;
    for (urlIndex = 0; urlIndex < urlArray.length; urlIndex++) {
      const ownerAndName = urlArray[urlIndex].match(this.ownerAndNameRegex);  // Match the owner and repo section of the URL

      if (ownerAndName !== null) {  // If regex was successful
        const ownerMatch = ownerAndName[0].match(this.ownerRegex); // Match the repo owner
        const nameMatch = ownerAndName[0].match(this.nameRegex);   // Match the repo name

        if (ownerMatch !== null && nameMatch !== null) {          // If both regexs successful
          var newRepositoryOwner = ownerMatch[0];
          var newRepositoryName = nameMatch[0];
          const newRepository: Repository = {
            owner: newRepositoryOwner,
            name: newRepositoryName,
          }

          repoArray.push(newRepository);
        }
        else {
          this.logger.add(2, "Error: Regex failed on " + ownerAndName[0]);
        }
      }
      else {
        this.logger.add(2, "Error: ownerAndName regex failed on " + urlArray[urlIndex]);
      }
    }
    return repoArray;
  }

  async npmRepos(): Promise<Repository[]> {
    const npmUrlArray = this.urlFileContents.match(this.npmRegex);
    if (npmUrlArray !== null) {
      const totalNpmUrls = npmUrlArray.length;
      
      // Add info to log file
      this.logger.add(2, totalNpmUrls + " NPM URLs found");
      this.logger.add(2, "npmUrlArray contents: ")
      this.logger.add(2, String(npmUrlArray));

      // Get the GitHub URL for the package
      try {
        const npmUrlResponse = await fetch(npmUrlArray[0]);
        const npmUrlText = await npmUrlResponse.text();

        const $ = cheerio.load(npmUrlText);
        /*
        const data = $.extract({
          red: ['._702d723c dib w-50 fl bb b--black-10 pr2 w-100'],
        });
        */
        /*
        const data = $.extract({
          red: ['.markdown-heading'],
        });
        */
        const data = $.extract({
          red: ['._702d723c'],
        });

        //console.log(data.red[0]);
        
        var test: Array<string> = [];
        test.push(data.red[0]);
        var array: Array<Repository> = this.ownerAndNameFromUrl(test);
        console.log(array[0]);

      }
      catch (error) {
        console.error(error.message);
      }
    }

    var npmRepoArray: Array<Repository> = [];  // Array of Repository interfaces that will be returned
    const newRepository: Repository = {
      owner: "k",
      name: "d",
    }

    var returnval: Array<Repository> = [];
    returnval.push(newRepository);

    return returnval;
  }

  githubRepos(): Repository[] {
    const githubUrlArray = this.urlFileContents.match(this.githubRegex);
    var githubRepoArray: Array<Repository> = [];  // Array of Repository interfaces that will be returned
    if (githubUrlArray !== null) {  // Check if any GitHub urls are in the URL_FILE
      const totalGithubUrls = githubUrlArray.length;

      // Add info to log file
      this.logger.add(2, totalGithubUrls + " GitHub URLs found");
      this.logger.add(2, "githubUrlArray contents: ")
      this.logger.add(2, String(githubUrlArray));

      // Loop through all github urls
      var githubUrlIndex: number = 0;
      for (githubUrlIndex = 0; githubUrlIndex < totalGithubUrls; githubUrlIndex++) {
        const ownerAndName = githubUrlArray[githubUrlIndex].match(this.ownerAndNameRegex);  // Match the owner and repo section of the URL

        if (ownerAndName !== null) {  // If regex was successful
          const ownerMatch = ownerAndName[0].match(this.ownerRegex); // Match the repo owner
          const nameMatch = ownerAndName[0].match(this.nameRegex);   // Match the repo name

          if (ownerMatch !== null && nameMatch !== null) {          // If both regexs successful
            var newRepositoryOwner = ownerMatch[0];
            var newRepositoryName = nameMatch[0];
            const newRepository: Repository = {
              owner: newRepositoryOwner,
              name: newRepositoryName,
            }

            githubRepoArray.push(newRepository);
          }
          else {
            this.logger.add(2, "Error: Regex failed on " + ownerAndName[0]);
          }
        }
        else {
          this.logger.add(2, "Error: ownerAndRepo regex failed on " + githubUrlArray[githubUrlIndex]);
        }
      }
    }
    else {
      this.logger.add(2, "No GitHub URLs in passed URL_FILE");
    }
    return githubRepoArray;
  }
}



