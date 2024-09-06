import axios from 'axios'; //run: npm install axios, for http requests

const repoOwner = 'cloudinary';
const repoName = 'cloudinary_npm';
const token = ''; // Replace with your actual GitHub token

interface Commit {
  sha: string;
  commit: {
    author: {
      date: string; // Date string in ISO format
    };
  };
}
interface Issue {
  id: number;
  state: string;
  pull_request?: object; // Field that indicates if it's a pull request
}

// Function to get total number of commits with pagination
async function getTotalCommits(): Promise<number> {
  try {
    let page = 1;
    let totalCommits = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get<Commit[]>(`https://api.github.com/repos/${repoOwner}/${repoName}/commits`, {
        headers: { Authorization: `token ${token}` },
        params: { per_page: 100, page },
      });

      totalCommits += response.data.length;
      hasMore = response.data.length === 100;
      page++;
    }

    return totalCommits;
  } catch (error) {
    console.error('Failed to fetch commits:', error);
    return 0;
  }
}

// Function to get the last commit date (most recent commit)
async function getLastCommitDate(): Promise<string | null> {
  try {
    const response = await axios.get<Commit[]>(`https://api.github.com/repos/${repoOwner}/${repoName}/commits`, {
      headers: { Authorization: `token ${token}` },
      params: { per_page: 1, page: 1 },
    });

    if (response.data.length > 0) {
      return response.data[0].commit.author.date;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch last commit:', error);
    return null;
  }
}

// Function to get the first commit date (oldest commit)
async function getFirstCommitDate(): Promise<string | null> {
  try {
    // Get the total number of commits
    const totalCommits = await getTotalCommits();
    if (totalCommits === 0) return null;

    // Fetch the first commit by retrieving the last page of commits
    const response = await axios.get<Commit[]>(`https://api.github.com/repos/${repoOwner}/${repoName}/commits`, {
      headers: { Authorization: `token ${token}` },
      params: { per_page: 1, page: totalCommits }, // Last page
    });

    if (response.data.length > 0) {
      return response.data[0].commit.author.date;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch first commit:', error);
    return null;
  }
}

// Function to calculate the difference between two dates in days
function calculateDaysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
}

// Function to get open and closed issues and the ratio, excluding pull requests
async function getIssueStats(): Promise<{ openIssues: number; closedIssues: number; openClosedRatio: number }> {
  try {
    let page = 1;
    let openIssues = 0;
    let closedIssues = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get<Issue[]>(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
        headers: { Authorization: `token ${token}` },
        params: { state: 'all', per_page: 100, page },
      });

      response.data.forEach(issue => {
        // Exclude pull requests from the count
        if (!issue.pull_request) {
          if (issue.state === 'open') {
            openIssues++;
          } else if (issue.state === 'closed') {
            closedIssues++;
          }
        }
      });

      hasMore = response.data.length === 100;
      page++;
    }

    const openClosedRatio = closedIssues > 0 ? closedIssues / openIssues : openIssues;

    return { openIssues, closedIssues, openClosedRatio };
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    return { openIssues: 0, closedIssues: 0, openClosedRatio: 0 };
  }
}

// Execute the functions and log the results
async function displayRepoStats() {
  const firstCommitDate = await getFirstCommitDate();
  const lastCommitDate = await getLastCommitDate();
  const totalCommits = await getTotalCommits();
  const { openIssues, closedIssues, openClosedRatio } = await getIssueStats();
  const totalIssues = openIssues + closedIssues // Calculate total issues excluding pull requests
  const percentOpen = openIssues / totalIssues
  const percentClosed = closedIssues / totalIssues

  console.log(`Total Commits: ${totalCommits}`);
  console.log(`Total Issues (excluding PRs): ${totalIssues}`);
  console.log(`Percentage of open issues: ${(percentOpen * 100).toFixed(2)}%`);
  console.log(`Percentage of closed issues: ${(percentClosed * 100).toFixed(2)}%`);
  console.log(`Closed/Open Issue Ratio: ${openClosedRatio.toFixed(2)}`);

  if (firstCommitDate && lastCommitDate) {
    const lifetimeInDays = calculateDaysDifference(firstCommitDate, lastCommitDate);
    console.log(`Repository Lifetime: ${lifetimeInDays} days`);
    console.log(`First Commit Date: ${new Date(firstCommitDate).toUTCString()}`);
    console.log(`Last Commit Date: ${new Date(lastCommitDate).toUTCString()}`);
  } else {
    console.log('Could not determine the repository lifetime.');
  }
}

displayRepoStats();