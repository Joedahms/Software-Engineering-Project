// @ts-nocheck
import { Octokit } from "@octokit/rest";
import { OctokitResponse } from "@octokit/types"
import { createMockOctokit } from "./__mocks__/octokit";
import { RepoStats } from "../src/api_access"; // Adjust the path as needed
import { Logger } from "../src/logger";

// Mock Logger
jest.mock("../src/logger");

describe("RepoStats", () => {
  let octokitInstance: jest.Mocked<Octokit>;
  let loggerInstance: jest.Mocked<Logger>;
  let repoStats: RepoStats;

  const owner = "test-owner";
  const repo = "test-repo";

  beforeEach(() => {
    jest.resetAllMocks();

    octokitInstance = createMockOctokit();

    loggerInstance = new Logger() as jest.Mocked<Logger>;
    (Logger as jest.Mock).mockImplementation(() => loggerInstance);

    repoStats = new RepoStats(owner, repo, octokitInstance);
  });

  test("getRepoData should fetch and calculate daysActive correctly", async () => {
    const mockRepoData = {
      created_at: "2020-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    };

    octokitInstance.repos.get.mockResolvedValueOnce({
      data: mockRepoData,
      status: 200,
      headers: {},
      url: "https://api.github.com/repos/test-owner/test-repo",
    });

    await repoStats.getRepoData();

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
    expect(loggerInstance.add).toHaveBeenCalledWith(1, `Getting when ${repo} created and last updated...`);
    expect(loggerInstance.add).toHaveBeenCalledWith(2, `Getting when ${repo} created and last updated...`);
    expect(loggerInstance.add).toHaveBeenCalledWith(1, `Successfully got when ${repo} was created and last updated`);
    expect(loggerInstance.add).toHaveBeenCalledWith(2, `${repo} created at ${created}`);
    expect(loggerInstance.add).toHaveBeenCalledWith(2, `${repo} last updated at ${updated}`);
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
