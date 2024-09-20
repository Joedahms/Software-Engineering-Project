import { Octokit } from "@octokit/rest";
import { Logger } from './logger.js'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // for GitHub token: export GITHUB_TOKEN="your_token_here"

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

// Function to fetch all pages using Octokit pagination
async function fetchAllPages<T>(endpoint: string, params: any = {}): Promise<T[]> {
  return octokit.paginate(endpoint, params);
}

// Function to fetch the number of commits in a repository
export async function fetchCommitCount(owner: string, repo: string): Promise<number> {
  try {
    // Fetch the first page with per_page set to 1 to minimize data transferred
    const response = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 1,
    });

    // Check if there's a link header with 'rel="last"' to find the total number of commits
    const linkHeader = response.headers.link;
    if (linkHeader) {
      const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    // If no link header, fallback to counting the response length (which means there's only 1 page of commits)
    return response.data.length;
  } catch (error) {
    handleError(error);
    return 0; // Return 0 in case of error
  }
}


// Whether or not repo has license
export async function checkLicense(owner: string, name: string): Promise<string> {
    // fetch the availability of licenses
    var logger = new Logger();
    logger.add(1, "Checking " + name + " for license");

    try {

      const license = await octokit.request('GET /repos/{owner}/{repo}/license', {
        owner: owner,
        repo: name,
      });
      const licenseName = license.data.license ? license.data.license.name : 'N/A';
      console.clear();  // Repos that don't have a license specifiec throw a 404 error.
                        // octokit.request automatically writes this to the console before entering the catch clause
                        // Not ideal but this clears this error from the console
      return licenseName;
    } 
    catch (error) {
      if (error.status === 404) {
        // need more error action here
        return " ";
      }
      else {
        // and here
        return " ";
      }
    }
}

// Function to fetch repository statistics
export class RepoStats {
  logger: Logger;

  owner: string;
  repo: string;
  totalOpenIssues: number;
  totalClosedIssues: number;
  issueRatio: string;
  totalMergedPullRequests: number;
  totalOpenPullRequests: number;
  totalClosedPullRequests: number;
  pullRequestRatio: string;
  totalForks: number;
  totalComments: number;
  commentFrequency: string;
  totalContributors: number;
  licenseName: string;
  readmeLength: number;
  daysActive: number;
  firstCommitDate: Date;
  lastCommitDate: Date;
  totalCommits: number;

  constructor(owner: string, repo: string) {
    this.logger = new Logger();

    this.owner = owner;
    this.repo = repo;
    
    // Initialize properties with default values
    this.totalOpenIssues = 0;
    this.totalClosedIssues = 0;
    this.issueRatio = 'N/A';
    this.totalMergedPullRequests = 0;
    this.totalOpenPullRequests = 0;
    this.totalClosedPullRequests = 0;
    this.pullRequestRatio = 'N/A';
    this.totalForks = 0;
    this.totalComments = 0;
    this.commentFrequency = 'N/A';
    this.totalContributors = 0;
    this.licenseName = "N/A";
    this.readmeLength = 0;
    this.daysActive = 0;
    this.firstCommitDate = new Date();
    this.lastCommitDate = new Date();
    this.totalCommits = 0;
  }
  async fetchRepoData(){
    const { data: repoData } = await octokit.repos.get({
      owner: this.owner,
      repo: this.repo
    });

    const created = new Date(repoData.created_at);
    const updated = new Date(repoData.updated_at);
    this.daysActive = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 3600 * 24));
  }

  async fetchTotalCommits(){
    this.totalCommits = await fetchCommitCount(this.owner, this.repo); // Fetch total commits
  }

  async fetchData() {
    try {
      // Open issues
      /*
      const openIssues = await fetchAllPages('GET /repos/{owner}/{repo}/issues', {
        owner: this.owner,
        repo: this.repo,
        state: 'open',
        per_page: 100,
      });
      this.totalOpenIssues = openIssues.filter((issue: any) => !issue.pull_request).length;

      // Closed issues
      const closedIssues = await fetchAllPages('GET /repos/{owner}/{repo}/issues', {
        owner: this.owner,
        repo: this.repo,
        state: 'closed',
        per_page: 100,
      });
      this.totalClosedIssues = closedIssues.filter((issue: any) => !issue.pull_request).length;
      this.issueRatio = this.totalOpenIssues > 0 ? (this.totalClosedIssues / this.totalOpenIssues).toFixed(2) : 'N/A';

      // Open pull requests
      const openPullRequests = await fetchAllPages('GET /repos/{owner}/{repo}/pulls', {
        owner: this.owner,
        repo: this.repo,
        state: 'open',
        per_page: 100,
      });

      // Closed pull requests
      const closedPullRequests = await fetchAllPages('GET /repos/{owner}/{repo}/pulls', {
        owner: this.owner,
        repo: this.repo,
        state: 'closed',
        per_page: 100,
      });

      // ?
      const repoData = await octokit.repos.get({
        owner: this.owner,
        repo: this.repo,
      });

      // Comments on issues
      const issueComments = await fetchAllPages('GET /repos/{owner}/{repo}/issues/comments', {
        owner: this.owner,
        repo: this.repo,
        per_page: 100,
      });

      // Comments on pull requests???
      const pullRequestComments = await fetchAllPages('GET /repos/{owner}/{repo}/pulls/comments', {
        owner: this.owner,
        repo: this.repo,
        per_page: 100,
      });

      // Contributors
      const contributors = await fetchAllPages('GET /repos/{owner}/{repo}/contributors', {
        owner: this.owner,
        repo: this.repo,
        per_page: 100,
      });

*/

      // License name
      const license = await checkLicense(this.owner, this.repo);
      this.licenseName = license;
      
      // Readme
      const readme = await octokit.repos.getReadme({ owner: this.owner, repo: this.repo });
      this.readmeLength = Buffer.from(readme.data.content, 'base64').toString('utf-8').length;
      /*

      // ???
      const firstCommit = await octokit.repos.listCommits({ owner: this.owner, repo: this.repo, per_page: 100 });

      /// ???
      const lastCommit = await octokit.repos.listCommits({ owner: this.owner, repo: this.repo, per_page: 100 });
  
      // Process fetched data
        
      this.totalMergedPullRequests = closedPullRequests.filter((pr: any) => pr.merged_at).length;
      this.totalOpenPullRequests = openPullRequests.length;
      this.totalClosedPullRequests = closedPullRequests.length;
      this.pullRequestRatio = this.totalOpenPullRequests > 0 ? (this.totalClosedPullRequests / this.totalOpenPullRequests).toFixed(2) : 'N/A';
  
      this.totalForks = repoData.data.forks_count;
  
      this.totalComments = issueComments.length + pullRequestComments.length;
*/
      this.totalCommits = await fetchCommitCount(this.owner, this.repo);
      /*
      this.commentFrequency = (this.totalCommits + this.totalOpenIssues + this.totalClosedIssues) > 0
        ? (this.totalComments / (this.totalCommits + this.totalOpenIssues + this.totalClosedIssues)).toFixed(2)
        : 'N/A';
  
      this.totalContributors = contributors.length;
  */
  
  
//      this.firstCommitDate = firstCommit.data[0]?.commit?.author?.date ? new Date(firstCommit.data[0].commit.author.date) : new Date();
 //     this.lastCommitDate = lastCommit.data[0]?.commit?.author?.date ? new Date(lastCommit.data[0].commit.author.date) : new Date();
  
    } catch (error) {
      handleError(error);
    }
  }  

  displayStats() {
    console.log('Total Commits:', this.totalCommits);
    console.log(`Total Open Issues: ${this.totalOpenIssues}`);
    console.log(`Total Closed Issues: ${this.totalClosedIssues}`);
    console.log(`Ratio of Closed/Open Issues: ${this.issueRatio}`);
    console.log(`Total Open Pull Requests: ${this.totalOpenPullRequests}`);
    console.log(`Total Closed Pull Requests: ${this.totalClosedPullRequests}`);
    console.log(`Total Merged Pull Requests: ${this.totalMergedPullRequests}`);
    console.log(`Ratio of Closed/Open Pull Requests: ${this.pullRequestRatio}`);
    console.log(`Total Forks: ${this.totalForks}`);
    console.log(`Total Comments: ${this.totalComments}`);
    console.log(`Comment Frequency: ${this.commentFrequency}`);
    console.log(`Total Contributors: ${this.totalContributors}`);
    console.log(`License: ${this.licenseName}`);
    console.log(`README Length: ${this.readmeLength} characters`);
    console.log(`Days Active: ${this.daysActive}`);
    console.log(`First Commit Date: ${this.firstCommitDate}`);
    console.log(`Last Commit Date: ${this.lastCommitDate}`);
  }
}


// Helper function to handle errors
function handleError(error: any): void {
  if (error.status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0') {
    const retryAfter = error.response?.headers['retry-after'] ? parseInt(error.response.headers['retry-after']) * 1000 : 60000;
    console.error('Rate limit exceeded. Waiting before retrying.');
    console.error(`Rate limit reset time: ${new Date(Date.now() + retryAfter)}`);
    setTimeout(() => {
      console.log('Retrying...');
    }, retryAfter);
  } else {
    console.error("An error occurred:", error);
  }
}

// Function to check the rate limit
async function checkRateLimit(): Promise<void> {
  try {
    const { data } = await octokit.rateLimit.get();
    console.log(`Remaining requests: ${data.rate.remaining}`);
    console.log(`Rate limit reset time: ${new Date(data.rate.reset * 1000)}`);
  } catch (error) {
    handleError(error);
  }
}

