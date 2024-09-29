import { Octokit } from "@octokit/rest";
import { OctokitResponse } from "@octokit/types";
import { RepoStats } from "../src/api_access";
import { Logger } from "../src/logger";
import { jest } from '@jest/globals';

// Mock Logger
jest.mock("../src/logger.js");

describe('RepoStats', () => {
  let repoStats: RepoStats;
  let mockLogger: jest.Mocked<Logger>;
  let octokitInstance: jest.Mocked<Octokit>;

  const owner = 'test-owner';
  const repo = 'test-repo';

  // Mock the Octokit class
  beforeAll(() => {
    jest.mock('@octokit/rest', () => {
      return {
        Octokit: jest.fn().mockImplementation(() => ({
          repos: {
            get: jest.fn(),
            getReadme: jest.fn(),
            listCommits: jest.fn(),
          },
          paginate: jest.fn(),
          request: jest.fn(),
          rateLimit: {
            get: jest.fn(),
          },
        })),
      };
    });
  });

  beforeEach(() => {
    jest.resetAllMocks();

    // Initialize mocked Logger
    mockLogger = new Logger() as jest.Mocked<Logger>;
    (Logger as jest.Mock).mockImplementation(() => mockLogger);

    // Instantiate RepoStats
    repoStats = new RepoStats(owner, repo);

    // Retrieve the mocked Octokit instance
    const { Octokit } = require("@octokit/rest");
    octokitInstance = (Octokit as jest.Mock).mock.instances[0] as jest.Mocked<Octokit>;
  });

  test('getRepoCreatedUpdated should fetch created_at and updated_at dates', async () => {
    const mockRepoData = {
      created_at: "2020-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    };

    const mockResponse: OctokitResponse<any, 200> = {
      data: mockRepoData,
      status: 200, // Exact status code
      headers: {},
      url: "https://api.github.com/repos/test-owner/test-repo",
    };

    octokitInstance.repos.get.mockResolvedValueOnce(mockResponse);

    await repoStats.getRepoCreatedUpdated();

    expect(octokitInstance.repos.get).toHaveBeenCalledWith({
      owner,
      repo,
    });

    const created = new Date(mockRepoData.created_at);
    const updated = new Date(mockRepoData.updated_at);
    const expectedDaysActive = Math.ceil(
      (updated.getTime() - created.getTime()) / (1000 * 3600 * 24)
    );

    expect(repoStats.daysActive).toBe(expectedDaysActive);
    expect(mockLogger.add).toHaveBeenCalledWith(1, `Getting when ${repo} created and last updated...`);
    expect(mockLogger.add).toHaveBeenCalledWith(2, `Getting when ${repo} created and last updated...`);
    expect(mockLogger.add).toHaveBeenCalledWith(1, `Successfully got when ${repo} was created and last updated`);
    expect(mockLogger.add).toHaveBeenCalledWith(2, `${repo} created at ${created}`);
    expect(mockLogger.add).toHaveBeenCalledWith(2, `${repo} last updated at ${updated}`);
  });

  test('checkRateLimit should update remainingRequests and rateLimitReset', async () => {
    const mockRateLimitData = {
      rate: {
        remaining: 4243,
        reset: Math.floor(Date.now() / 1000) + 3600, // 1 hour later
      },
    };

    const mockRateLimitResponse: OctokitResponse<any, 200> = {
      data: mockRateLimitData,
      status: 200, // Exact status code
      headers: {},
      url: "https://api.github.com/rate_limit",
    };

    octokitInstance.rateLimit.get.mockResolvedValueOnce(mockRateLimitResponse);

    await repoStats.checkRateLimit();

    expect(octokitInstance.rateLimit.get).toHaveBeenCalled();

    expect(repoStats.remainingRequests).toBe(mockRateLimitData.rate.remaining);
    expect(repoStats.rateLimitReset).toEqual(new Date(mockRateLimitData.rate.reset * 1000));
    expect(mockLogger.add).toHaveBeenCalledWith(2, "Remaining API requests: 4243");
    expect(mockLogger.add).toHaveBeenCalledWith(2, "API rate limit resets at " + new Date(mockRateLimitData.rate.reset * 1000));
  });

  test('getRepoCreatedUpdated should handle errors gracefully', async () => {
    const mockError = {
      status: 500,
      message: "Internal Server Error",
    };

    octokitInstance.repos.get.mockRejectedValueOnce(mockError);

    // Spy on process.exit
    const exitMock = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
      throw new Error(`process.exit: ${code}`);
    });

    // Spy on console.error
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(repoStats.getRepoCreatedUpdated()).rejects.toThrow("process.exit: 1");

    expect(octokitInstance.repos.get).toHaveBeenCalledWith({
      owner,
      repo,
    });

    expect(mockLogger.add).toHaveBeenCalledWith(2, "Handling error: [object Object] ...");
    expect(consoleErrorMock).toHaveBeenCalledWith("An error occurred:", mockError);

    // Restore mocks
    exitMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  test('getRepoStats should fetch all metrics correctly', async () => {
    // Mock methods called within getRepoStats

    // Mock getOpenIssues
    octokitInstance.paginate.mockResolvedValueOnce([
      { pull_request: null },
      { pull_request: null },
      { pull_request: { url: "pull_request_url" } }, // only count issues without pull_request
    ]);

    // Mock checkRateLimit
    const mockRateLimitData = {
      rate: {
          remaining: 4243,
          reset: Math.floor(Date.now() / 1000) + 3600, // 1 hour later
      },
    };
    const mockRateLimitResponse: OctokitResponse<any, 200> = {
      data: mockRateLimitData,
      status: 200, // Exact status code
      headers: {},
      url: "https://api.github.com/rate_limit",
    };
    octokitInstance.rateLimit.get.mockResolvedValueOnce(mockRateLimitResponse);

    // Mock getTotalIssues
    octokitInstance.paginate.mockResolvedValueOnce([
      { pull_request: null },
      { pull_request: null },
      { pull_request: { url: "pull_request_url" } },
      { pull_request: null },
    ]);

    // Mock checkRateLimit again
    octokitInstance.rateLimit.get.mockResolvedValueOnce(mockRateLimitResponse);

    // Mock getReadmeContentAndLength
    const readmeContent = Buffer.from("This is a test README").toString('base64');
    const mockReadmeResponse: OctokitResponse<{ content: string; encoding: string }, 200> = {
      data: {
          content: readmeContent,
          encoding: 'base64',
      },
      status: 200,
      headers: {},
      url: "https://api.github.com/repos/test-owner/test-repo/readme",
    };
    octokitInstance.repos.getReadme.mockResolvedValueOnce(mockReadmeResponse as any);

    // Mock checkRateLimit again
    octokitInstance.rateLimit.get.mockResolvedValueOnce(mockRateLimitResponse);

    // Mock getLicenseName
    const mockLicenseResponse: OctokitResponse<{ license: { name: string } }, 200> = {
      data: {
          license: {
              name: "MIT License",
          },
      },
      status: 200,
      headers: {},
      url: "https://api.github.com/repos/test-owner/test-repo/license",
    };
    octokitInstance.request.mockResolvedValueOnce(mockLicenseResponse);

    // Mock checkRateLimit again
    octokitInstance.rateLimit.get.mockResolvedValueOnce(mockRateLimitResponse);

    // Mock getCommitCount
    const mockCommitCountResponse: OctokitResponse<any, 200> = {
      data: [], // Adjust according to expected data structure
      status: 200,
      headers: {
        link: '<https://api.github.com/repositories/123456789/commits?per_page=1&page=5979>; rel="last"',
      },
      url: "https://api.github.com/repos/test-owner/test-repo/commits",
    };
    octokitInstance.repos.listCommits.mockResolvedValueOnce(mockCommitCountResponse);

    // Mock checkRateLimit again
    octokitInstance.rateLimit.get.mockResolvedValueOnce(mockRateLimitResponse);

    await repoStats.getRepoStats();

    // Assert the metrics are set correctly
    expect(repoStats.totalOpenIssues).toBe(2); // 3 issues fetched, 1 has pull_request
    expect(repoStats.totalIssues).toBe(3); // 4 issues fetched, 1 has pull_request
    expect(repoStats.readme).toBe("This is a test README");
    expect(repoStats.readmeLength).toBe(5); // "This is a test README" has 5 words
    expect(repoStats.licenseName).toBe("MIT License");
    expect(repoStats.totalCommits).toBe(5979);
    expect(repoStats.remainingRequests).toBe(mockRateLimitData.rate.remaining);
    expect(repoStats.rateLimitReset).toEqual(new Date(mockRateLimitData.rate.reset * 1000));

    // Assert logger calls
    expect(mockLogger.add).toHaveBeenCalledWith(1, "Getting open issues...");
    expect(mockLogger.add).toHaveBeenCalledWith(2, "Took 1.7538617250000001 seconds to get all open issues from express"); // Sample from log.txt
  });
});
