"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios")); //run: npm install axios, for http requests
const repoOwner = 'cloudinary';
const repoName = 'cloudinary_npm';
const token = ''; // Replace with your actual GitHub token
// Function to get total number of commits with pagination
function getTotalCommits() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let page = 1;
            let totalCommits = 0;
            let hasMore = true;
            while (hasMore) {
                const response = yield axios_1.default.get(`https://api.github.com/repos/${repoOwner}/${repoName}/commits`, {
                    headers: { Authorization: `token ${token}` },
                    params: { per_page: 100, page },
                });
                totalCommits += response.data.length;
                hasMore = response.data.length === 100;
                page++;
            }
            return totalCommits;
        }
        catch (error) {
            console.error('Failed to fetch commits:', error);
            return 0;
        }
    });
}
// Function to get the last commit date (most recent commit)
function getLastCommitDate() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://api.github.com/repos/${repoOwner}/${repoName}/commits`, {
                headers: { Authorization: `token ${token}` },
                params: { per_page: 1, page: 1 },
            });
            if (response.data.length > 0) {
                return response.data[0].commit.author.date;
            }
            return null;
        }
        catch (error) {
            console.error('Failed to fetch last commit:', error);
            return null;
        }
    });
}
// Function to get the first commit date (oldest commit)
function getFirstCommitDate() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get the total number of commits
            const totalCommits = yield getTotalCommits();
            if (totalCommits === 0)
                return null;
            // Fetch the first commit by retrieving the last page of commits
            const response = yield axios_1.default.get(`https://api.github.com/repos/${repoOwner}/${repoName}/commits`, {
                headers: { Authorization: `token ${token}` },
                params: { per_page: 1, page: totalCommits }, // Last page
            });
            if (response.data.length > 0) {
                return response.data[0].commit.author.date;
            }
            return null;
        }
        catch (error) {
            console.error('Failed to fetch first commit:', error);
            return null;
        }
    });
}
// Function to calculate the difference between two dates in days
function calculateDaysDifference(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
}
// Function to get open and closed issues and the ratio, excluding pull requests
function getIssueStats() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let page = 1;
            let openIssues = 0;
            let closedIssues = 0;
            let hasMore = true;
            while (hasMore) {
                const response = yield axios_1.default.get(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
                    headers: { Authorization: `token ${token}` },
                    params: { state: 'all', per_page: 100, page },
                });
                response.data.forEach(issue => {
                    // Exclude pull requests from the count
                    if (!issue.pull_request) {
                        if (issue.state === 'open') {
                            openIssues++;
                        }
                        else if (issue.state === 'closed') {
                            closedIssues++;
                        }
                    }
                });
                hasMore = response.data.length === 100;
                page++;
            }
            const openClosedRatio = closedIssues > 0 ? closedIssues / openIssues : openIssues;
            return { openIssues, closedIssues, openClosedRatio };
        }
        catch (error) {
            console.error('Failed to fetch issues:', error);
            return { openIssues: 0, closedIssues: 0, openClosedRatio: 0 };
        }
    });
}
// Execute the functions and log the results
function displayRepoStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const firstCommitDate = yield getFirstCommitDate();
        const lastCommitDate = yield getLastCommitDate();
        const totalCommits = yield getTotalCommits();
        const { openIssues, closedIssues, openClosedRatio } = yield getIssueStats();
        const totalIssues = openIssues + closedIssues; // Calculate total issues excluding pull requests
        const percentOpen = openIssues / totalIssues;
        const percentClosed = closedIssues / totalIssues;
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
        }
        else {
            console.log('Could not determine the repository lifetime.');
        }
    });
}
displayRepoStats();
