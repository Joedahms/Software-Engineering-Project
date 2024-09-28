import { Octokit } from "@octokit/rest";
import { RepoStats } from "../src/api_access"; // Adjust the path as needed
import { Logger } from "../src/logger";
import { createMockOctokit } from "./__mocks__/octokit";

// Mock Logger
jest.mock("../src/logger");

describe("RepoStats", () => {
  let octokitInstance: Octokit;
  let loggerInstance: jest.Mocked<Logger>;
  let repoStats: RepoStats;

  const owner = "test-owner";
  const repo = "test-repo";

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();

    // Create a mocked Octokit instance
    let octokitInstance: jest.Mocked<Octokit>;

    // Create a mock Logger instance
    loggerInstance = new Logger() as jest.Mocked<Logger>;
    (Logger as jest.Mock).mockImplementation(() => loggerInstance);

    // Instantiate RepoStats with the mocked Octokit and Logger
    repoStats = new RepoStats(owner, repo, octokitInstance);
  });

  test("getRepoData should fetch and calculate daysActive correctly", async () => {
    const mockRepoData = {
      created_at: "2020-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    };

    // Mock octokit.repos.get to return mockRepoData
    octokitInstance.repos.get.mockResolvedValueOnce({
      data: mockRepoData,
      headers: {},
      status: 200;
      url: "https://api.github.com/repos/test-owner/test-repo",
      // Remove 'statusText' if not part of OctokitResponse
    });

    await repoStats.getRepoData();

    // Verify that octokit.repos.get was called with correct parameters
    expect(octokitInstance.repos.get).toHaveBeenCalledWith({
      owner,
      repo,
    });

    // Calculate expected daysActive
    const created = new Date(mockRepoData.created_at);
    const updated = new Date(mockRepoData.updated_at);
    const expectedDaysActive = Math.ceil(
      (updated.getTime() - created.getTime()) / (1000 * 3600 * 24)
    );

    // Verify that daysActive is correctly calculated
    expect(repoStats.daysActive).toBe(expectedDaysActive);

    // Verify logging
    expect(loggerInstance.add).toHaveBeenCalledWith(
      1,
      `Getting when ${repo} created and last updated...`
    );
    expect(loggerInstance.add).toHaveBeenCalledWith(
      2,
      `Getting when ${repo} created and last updated...`
    );
    expect(loggerInstance.add).toHaveBeenCalledWith(
      1,
      `Successfully got when ${repo} was created and last updated`
    );
    expect(loggerInstance.add).toHaveBeenCalledWith(
      2,
      `${repo} created at ${created}`
    );
    expect(loggerInstance.add).toHaveBeenCalledWith(
      2,
      `${repo} last updated at ${updated}`
    );
  });

  test("getRepoStats should fetch all repository statistics correctly", async () => {
    // Mock octokit.paginate for open issues (excluding pull requests)
    const mockOpenIssues = [
      { id: 1 },
      { id: 2, pull_request: {} }, // This is a pull request and should be excluded
    ];
    octokitInstance.paginate.mockResolvedValueOnce(mockOpenIssues);

    // Mock rate limit after fetching open issues
    octokitInstance.rateLimit.get.mockResolvedValueOnce({
      data: {
        rate: {
          remaining: 5000,
          reset: Math.floor(Date.now() / 1000) + 3600, // 1 hour later
        },
      },
      status: 200,
      headers: {},
      url: "https://api.github.com/rate_limit",
      // Remove 'statusText' if not part of OctokitResponse
    });

    // Mock octokit.paginate for all issues (excluding pull requests)
    const mockAllIssues = [
      { id: 1 },
      { id: 2, pull_request: {} }, // Pull request
      { id: 3 },
    ];
    octokitInstance.paginate.mockResolvedValueOnce(mockAllIssues);

    // Mock rate limit after fetching all issues
    octokitInstance.rateLimit.get.mockResolvedValueOnce({
      data: {
        rate: {
          remaining: 4999,
          reset: Math.floor(Date.now() / 1000) + 3600,
        },
      },
      status: 200,
      headers: {},
      url: "https://api.github.com/rate_limit",
      // Remove 'statusText' if not part of OctokitResponse
    });

    // Mock octokit.repos.getReadme to return mock README content
    const mockReadmeContent = "This is a README file";
    octokitInstance.repos.getReadme.mockResolvedValueOnce({
      data: {
        content: Buffer.from(mockReadmeContent).toString("base64"),
      },
      status: 200,
      headers: {},
      url: "https://api.github.com/repos/test-owner/test-repo/readme",
      // Remove 'statusText' if not part of OctokitResponse
    });

    // Mock octokit.request for fetching license
    octokitInstance.request.mockResolvedValueOnce({
      data: {
        license: {
          name: "MIT License",
        },
      },
      status: 200,
      headers: {},
      url: "https://api.github.com/repos/test-owner/test-repo/license",
      // Remove 'statusText' if not part of OctokitResponse
    });

    // Mock octokit.repos.listCommits to return mock commit data
    octokitInstance.repos.listCommits.mockResolvedValueOnce({
      data: [{}, {}], // Simulating 2 commits
      status: 200,
      headers: {
        link: '<https://api.github.com/repos/test-owner/test-repo/commits?page=2>; rel="last"',
      },
      url: "https://api.github.com/repos/test-owner/test-repo/commits",
      // Remove 'statusText' if not part of OctokitResponse
    });

    // Mock octokit.repos.get for getRepoData called within getRepoStats
    const mockRepoData = {
      created_at: "2020-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    };
    octokitInstance.repos.get.mockResolvedValueOnce({
      data: mockRepoData,
      status: 200,
      headers: {},
      url: "https://api.github.com/repos/test-owner/test-repo",
      // Remove 'statusText' if not part of OctokitResponse
    });

    await repoStats.getRepoStats();

    // Verify that paginate was called for open issues
    expect(octokitInstance.paginate).toHaveBeenNthCalledWith(
      1,
      "GET /repos/{owner}/{repo}/issues",
      {
        owner,
        repo,
        state: "open",
        per_page: 100,
      }
    );

    // Verify that totalOpenIssues excludes pull requests
    expect(repoStats.totalOpenIssues).toBe(1); // Only one open issue excluding PR

    // Verify rate limit after open issues
    expect(octokitInstance.rateLimit.get).toHaveBeenCalledTimes(1);

    // Verify that paginate was called for all issues
    expect(octokitInstance.paginate).toHaveBeenNthCalledWith(
      2,
      "GET /repos/{owner}/{repo}/issues",
      {
        owner,
        repo,
        state: "all",
        per_page: 100,
      }
    );

    // Verify that totalIssues excludes pull requests
    expect(repoStats.totalIssues).toBe(2); // Two issues excluding PR

    // Verify rate limit after all issues
    expect(octokitInstance.rateLimit.get).toHaveBeenCalledTimes(2);

    // Verify getReadme was called correctly
    expect(octokitInstance.repos.getReadme).toHaveBeenCalledWith({
      owner,
      repo,
    });

    // Verify readme content and word count
    expect(repoStats.readme).toBe(mockReadmeContent);
    expect(repoStats.readmeLength).toBe(5); // "This is a README file" has 5 words

    // Verify license fetching
    expect(octokitInstance.request).toHaveBeenCalledWith('GET /repos/{owner}/{repo}/license', {
      owner,
      repo,
    });
    expect(repoStats.licenseName).toBe("MIT License");

    // Verify commit count fetching
    expect(octokitInstance.repos.listCommits).toHaveBeenCalledWith({
      owner,
      repo,
      per_page: 1,
    });
    expect(repoStats.totalCommits).toBe(2);
  });

  test("checkRateLimit should handle rate limit exceeded error gracefully", async () => {
    const rateLimitError = {
      status: 403,
      response: {
        headers: {
          'x-ratelimit-remaining': '0',
          'retry-after': '1', // 1 second
        },
      },
    };

    // Mock octokit.rateLimit.get to reject with rateLimitError
    octokitInstance.rateLimit.get.mockRejectedValueOnce(rateLimitError);

    // Spy on console methods and setTimeout
    const consoleClearMock = jest.spyOn(console, 'clear').mockImplementation(() => {});
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    const setTimeoutMock = jest.spyOn(global, 'setTimeout').mockImplementation((fn: () => void, ms?: number) => {
      fn();
      return 0 as unknown as NodeJS.Timeout; // Return a dummy Timeout
    });

    // Execute checkRateLimit
    await repoStats.checkRateLimit();

    // Verify that rateLimit.get was called
    expect(octokitInstance.rateLimit.get).toHaveBeenCalled();

    // Verify that logger was called appropriately
    expect(loggerInstance.add).toHaveBeenCalledWith(
      2,
      "Handling error: " + JSON.stringify(rateLimitError) + " ..."
    );

    // Verify that console.clear was called
    expect(consoleClearMock).toHaveBeenCalled();

    // Verify that error messages were logged to console
    expect(consoleErrorMock).toHaveBeenCalledWith('Rate limit exceeded. Waiting before retrying.');
    expect(consoleErrorMock).toHaveBeenCalledWith(
      `Rate limit reset time: ${new Date(Date.now() + 1000)}`
    );

    // Verify that setTimeout was called with correct arguments
    expect(setTimeoutMock).toHaveBeenCalledWith(expect.any(Function), 1000);

    // Restore mocked functions
    consoleClearMock.mockRestore();
    consoleErrorMock.mockRestore();
    setTimeoutMock.mockRestore();
  });

  test("checkRateLimit should handle non-rate limit errors correctly", async () => {
    const genericError = {
      status: 500,
      message: "Internal Server Error",
    };

    // Mock octokit.rateLimit.get to reject with genericError
    octokitInstance.rateLimit.get.mockRejectedValueOnce(genericError);

    // Spy on console.error and process.exit
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitMock = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit: ${code}`);
    }) as any);

    // Execute checkRateLimit and expect it to throw due to process.exit
    await expect(repoStats.checkRateLimit()).rejects.toThrow("process.exit: 1");

    // Verify that rateLimit.get was called
    expect(octokitInstance.rateLimit.get).toHaveBeenCalled();

    // Verify that logger was called appropriately
    expect(loggerInstance.add).toHaveBeenCalledWith(
      2,
      "Handling error: " + JSON.stringify(genericError) + " ..."
    );

    // Verify that generic error was logged to console
    expect(consoleErrorMock).toHaveBeenCalledWith("An error occurred:", genericError);

    // Verify that process.exit was called with code 1
    expect(exitMock).toHaveBeenCalledWith(1);

    // Restore mocked functions
    consoleErrorMock.mockRestore();
    exitMock.mockRestore();
  });
});
