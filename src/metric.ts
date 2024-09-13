import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";


//dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 

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


//checkRateLimit();
//fetchRepoStats('Joedahms', 'Software-Engineering-Project');
