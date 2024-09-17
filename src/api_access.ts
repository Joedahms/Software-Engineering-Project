import { Octokit, App } from "octokit";
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
async function fetchCommits(owner: string, repo: string): Promise<number> {
  try {
    const commits = await octokit.paginate(octokit.repos.listCommits, {
      owner,
      repo,
      per_page: 100,
    });
    return commits.length;
  } catch (error) {
    handleError(error);
    return 0; // Return 0 in case of error
  }
}

// Whether or not repo has license
export async function checkLicense(desiredLicense: string, owner: string, name: string): Promise<number> {
    // fetch the availability of licenses
    var logger = new Logger();
    logger.add(1, "Checking " + name + " for " + desiredLicense);
    try {
      const license = await octokit.request('GET /repos/{owner}/{repo}/license', {
        owner: owner,
        repo: name,
      });
      const licenseName = license.data.license ? license.data.license.name : 'N/A';
      if (licenseName === desiredLicense) {
        return 1;
      }
      else {
        return 0;
      }
    }
    catch (error) {
      if (error.status) {
        // need more error action here
        logger.add(1, name + " encountered an Octokit error when checking the license");
        return 2;
      }
      else {
        throw error;
        return 2;
      }
    }
}

// Function to fetch repository statistics
export async function fetchRepoStats(owner: string, repo: string) {
  try {
    // Fetch issues
    const openIssues = await fetchAllPages('GET /repos/{owner}/{repo}/issues', {
      owner,
      repo,
      state: 'open',
      per_page: 100
    });
    const closedIssues = await fetchAllPages('GET /repos/{owner}/{repo}/issues', {
      owner,
      repo,
      state: 'closed',
      per_page: 100
    });
    const totalOpenIssues = openIssues.filter((issue: any) => !issue.pull_request).length;
    const totalClosedIssues = closedIssues.filter((issue: any) => !issue.pull_request).length;
    const issueRatio = totalOpenIssues > 0 ? (totalClosedIssues / totalOpenIssues).toFixed(2) : 'N/A';

    // Fetch pull requests
    const openPullRequests = await fetchAllPages('GET /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      state: 'open',
      per_page: 100
    });
    const closedPullRequests = await fetchAllPages('GET /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      state: 'closed',
      per_page: 100
    });
    const totalMergedPullRequests = closedPullRequests.filter((pr: any) => pr.merged_at).length;
    const totalOpenPullRequests = openPullRequests.length;
    const totalClosedPullRequests = closedPullRequests.length;
    const pullRequestRatio = totalOpenPullRequests > 0 ? (totalClosedPullRequests / totalOpenPullRequests).toFixed(2) : 'N/A';

    // Fetch repository metadata (includes forks, comments, etc.)
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo
    });
    const totalForks = repoData.forks_count;

    // Fetch comments
    const issueComments = await fetchAllPages('GET /repos/{owner}/{repo}/issues/comments', {
      owner,
      repo,
      per_page: 100
    });
    const pullRequestComments = await fetchAllPages('GET /repos/{owner}/{repo}/pulls/comments', {
      owner,
      repo,
      per_page: 100
    });
    const totalComments = issueComments.length + pullRequestComments.length;

    // Calculate comment frequency
    const totalCommits = await fetchCommits(owner, repo); // Fetch total commits
    const commentFrequency = (totalCommits + totalOpenIssues + totalClosedIssues) > 0
      ? (totalComments / (totalCommits + totalOpenIssues + totalClosedIssues)).toFixed(2)
      : 'N/A';

    // fetch the number of contributors
    const contributors = await fetchAllPages('GET /repos/{owner}/{repo}/contributors', {
      owner,
      repo,
      per_page: 100
    });
    const totalContributors = contributors.length;

    // License
    const licenseName = await checkLicense("MIT License", owner, repo);

    // fetch the README file length in characters
    const readme = await octokit.repos.getReadme({ owner, repo });
    const readmeLength = Buffer.from(readme.data.content, 'base64').toString('utf-8').length;


    // fetch the working life of the repository in days
    const created = new Date(repoData.created_at);
    const updated = new Date(repoData.updated_at);
    const daysActive = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 3600 * 24));

    
    // fetch the date of the first commit
    const firstCommit = await octokit.repos.listCommits({ owner, repo, per_page: 100 });
    const firstCommitDate = firstCommit.data[0]?.commit?.author?.date ? new Date(firstCommit.data[0].commit.author.date) : new Date();
    // fetch the date of the last commit
    const lastCommit = await octokit.repos.listCommits({ owner, repo, per_page: 100 });
    const lastCommitDate = lastCommit.data[0]?.commit?.author?.date ? new Date(lastCommit.data[0].commit.author.date) : new Date();

    // Output the results
    console.log('Total Commits:', totalCommits);
    console.log(`Total Open Issues: ${totalOpenIssues}`);
    console.log(`Total Closed Issues: ${totalClosedIssues}`);
    console.log(`Ratio of Closed/Open Issues: ${issueRatio}`);
    console.log(`Total Open Pull Requests: ${totalOpenPullRequests}`);
    console.log(`Total Closed Pull Requests: ${totalClosedPullRequests}`);
    console.log(`Total Merged Pull Requests: ${totalMergedPullRequests}`);
    console.log(`Ratio of Closed/Open Pull Requests: ${pullRequestRatio}`);
    console.log(`Total Forks: ${totalForks}`);
    console.log(`Total Comments: ${totalComments}`);
    console.log(`Comment Frequency: ${commentFrequency}`);
    console.log(`Total Contributors: ${totalContributors}`);
    console.log(`License: ${licenseName}`); 
    console.log(`README Length: ${readmeLength} characters`);
    console.log(`Days Active: ${daysActive}`);
    console.log(`First Commit Date: ${firstCommitDate}`);
    console.log(`Last Commit Date: ${lastCommitDate}`);
    
    
  } catch (error) {
    handleError(error);
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

