import axios from 'axios';
import * as dotenv from 'dotenv'; // Load environment variables from .env

dotenv.config(); // Load GitHub token from .env file

const token = process.env.GITHUB_TOKEN;
const perPage = 100; // Max allowed per page by GitHub API

// Function to handle pagination (checks every page on GitHub repository and retrieve the data requested)
const fetchAllPages = async (url: string, params: any = {}) => {
    let results: any[] = [];
    let page = 1;

    while (true) {
        const response = await axios.get(url, {
            headers: { Authorization: token ? `token ${token}` : undefined },
            params: { ...params, page, per_page: perPage },
        });
        results = results.concat(response.data);

        if (response.data.length < perPage) break;
        page += 1;
    }
    return results;
};

// Function to fetch repository details including the default branch
const fetchRepoDetails = async (owner: string, repo: string) => {
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const response = await axios.get(repoUrl, {
        headers: { Authorization: token ? `token ${token}` : undefined },
    });
    return response.data;
};


// Function to fetch number of contributors
const fetchContributors = async (owner: string, repo: string) => {
    const contributorsUrl = `https://api.github.com/repos/${owner}/${repo}/contributors`;
    const contributors = await fetchAllPages(contributorsUrl);
    return contributors.length;
};


// Function to fetch comments on issues and pull requests
const fetchComments = async (owner: string, repo: string) => {
    // Fetch issue comments
    const issueCommentsUrl = `https://api.github.com/repos/${owner}/${repo}/issues/comments`;
    const issueComments = await fetchAllPages(issueCommentsUrl);

    // Fetch pull request comments
    const pullRequestCommentsUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/comments`;
    const pullRequestComments = await fetchAllPages(pullRequestCommentsUrl);
    const totalComments = issueComments.length + pullRequestComments.length;
    return totalComments;
};


// Function to calculate comment frequency
const calculateCommentFrequency = (totalComments: number, totalCommits: number, totalOpenIssues: number, totalClosedIssues: number) => {
    const totalIssues = totalOpenIssues + totalClosedIssues;
    const commentFrequency = totalComments / (totalCommits + totalIssues);
    return commentFrequency.toFixed(2);
};


// Function to fetch repository statistics
const fetchRepoStats = async (owner: string, repo: string) => {
    try {
        // Fetch repository details to get the default branch name
        const repoDetails = await fetchRepoDetails(owner, repo);
        const defaultBranch = repoDetails.default_branch; // Get the default branch name

        const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;
        const commitsResponse = await axios.get(commitsUrl, {
            headers: { Authorization: token ? `token ${token}` : undefined },
            params: { per_page: 1 },
        });
        const totalCommits = commitsResponse.headers['link']
            ? parseInt(commitsResponse.headers['link'].match(/&page=(\d+)>; rel="last"/)?.[1] || '1')
            : commitsResponse.data.length;

        // Fetch issues
        const issuesUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;
        const openIssues = await fetchAllPages(issuesUrl, { state: 'open', pull_request: false });
        const closedIssues = await fetchAllPages(issuesUrl, { state: 'closed', pull_request: false });
        const totalOpenIssues = openIssues.filter((issue: any) => !issue.pull_request).length;
        const totalClosedIssues = closedIssues.filter((issue: any) => !issue.pull_request).length; // Filter out pull requests
        const issueRatio = totalOpenIssues > 0 ? (totalClosedIssues / totalOpenIssues).toFixed(2) : 'N/A';

        // Fetch pull requests
        const pullsUrl = `https://api.github.com/repos/${owner}/${repo}/pulls`;
        const openPulls = await fetchAllPages(pullsUrl, { state: 'open' });
        const closedPulls = await fetchAllPages(pullsUrl, { state: 'closed' });
        const totalMergedPulls = closedPulls.filter((pr: any) => pr.merged_at).length;
        const totalOpenPulls = openPulls.length;
        const totalClosedPulls = closedPulls.length;
        const pullRequestsRatio = totalOpenPulls > 0 ? (totalClosedPulls / totalOpenPulls).toFixed(2) : 'N/A';

        // Fetch repository metadata (includes forks, watchers, etc.)
        const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const repoResponse = await axios.get(repoUrl, {
            headers: { Authorization: token ? `token ${token}` : undefined },
        });
        const { forks_count, created_at, license } = repoResponse.data;

        // Calculate the working lifetime (from creation to the latest commit)
        const latestCommitUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;
        const latestCommitResponse = await axios.get(latestCommitUrl, {
            headers: { Authorization: token ? `token ${token}` : undefined },
        });
        const latestCommitDate = new Date(latestCommitResponse.data[0].commit.committer.date);
        const creationDate = new Date(created_at);
        const workingLifetime = Math.round((latestCommitDate.getTime() - creationDate.getTime()) / (1000 * 3600 * 24));  // round the days

        // Fetch README length
        const readmeUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
        const readmeResponse = await axios.get(readmeUrl, {
            headers: { Authorization: token ? `token ${token}` : undefined },
            params: { ref: defaultBranch }, // Adjust ref if needed to main/master (but is not necessary)
        });
        const readmeContent = Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');
        const readmeLength = readmeContent.length;

        // Fetch total contributors
        const totalContributors = await fetchContributors(owner, repo);

        // Fetch total comments and calculate comment frequency
        const totalComments = await fetchComments(owner, repo);
        const commentFrequency = calculateCommentFrequency(totalComments, totalCommits, totalOpenIssues, totalClosedIssues);
        // Output the results
        console.log(`Total Commits: ${totalCommits}`);
        console.log(`Total Open Issues: ${totalOpenIssues}`);
        console.log(`Total Closed Issues: ${totalClosedIssues}`);
        console.log(`Ratio of Closed/Open Issues: ${issueRatio}`);
        console.log(`Ratio of Closed/Open Pull Requests: ${pullRequestsRatio}`);
        console.log(`Total Open Pull Requests: ${openPulls.length}`);
        console.log(`Total Closed Pull Requests: ${closedPulls.length}`);
        console.log(`Total Merged Pull Requests: ${totalMergedPulls}`);
        console.log(`Total Forks: ${forks_count}`);
        console.log(`Working lifetime (days): ${workingLifetime}`);
        console.log(`README length (characters): ${readmeLength}`);
        console.log(`License: ${license?.name || 'No license'}`);
        console.log(`Total Contributors: ${totalContributors}`);
        console.log(`Total Comments: ${totalComments}`);
        console.log(`Comment Frequency: ${commentFrequency}`);

    } catch (error) {
        handleError(error);
    }
};


// Helper function to handle errors
const handleError = (error: any) => {
    if (axios.isAxiosError(error)) {
        console.error('Error message:', error.message);
        console.error('Error response:', error.response?.data);
    } else {
        console.error('An unexpected error occurred:', error);
    }
};


// Check the API rate limit
const checkRateLimit = async () => {
    const headers = {
        Authorization: token ? `token ${token}` : undefined,
    };

    const rateLimitUrl = 'https://api.github.com/rate_limit';
    const response = await axios.get(rateLimitUrl, { headers });
    console.log(response.data);
};

checkRateLimit().catch(error => {
    console.log(error);
})


fetchRepoStats('lodash', 'lodash').then((data) => console.log(data));


// 'cloudinary', 'cloudinary_npm' => https://github.com/cloudinary/cloudinary_npm
// 'Joedahms', 'Software-Engineering-Project' => https://github.com/Joedahms/Software-Engineering-Project
// 'lodash', 'lodash' => https://github.com/lodash/lodash
// 'nullivex', 'nodist' => https://github.com/nullivex/nodist
// https://www.npmjs.com/package/express
// https://www.npmjs.com/package/browserify




