// @ts-nocheck
import { Main } from "../src/main";
import { UrlFileParser, RepositoryUrlData } from "../src/urlFileParser.js";
import { Logger } from "../src/logger.js";
import { Repository } from "../src/repository.js";

// Import the mock Octokit
import { createMockOctokit } from "./__mocks__/octokit";

jest.mock("../src/urlFileParser.js");
jest.mock("../src/logger.js");
jest.mock("../src/repository.js");

describe("Main Class", () => {
  let mainInstance: Main;
  let mockUrlFileParser: jest.Mocked<UrlFileParser>;
  let mockLogger: jest.Mocked<Logger>;
  let mockRepository: jest.Mocked<Repository>;
  let mockOctokit: ReturnType<typeof createMockOctokit>;

  const owner = "test-owner";
  const repo = "test-repo";

  beforeEach(() => {
    jest.resetAllMocks();

    // Initialize mocks
    mockUrlFileParser = new UrlFileParser() as jest.Mocked<UrlFileParser>;
    (UrlFileParser as jest.Mock).mockImplementation(() => mockUrlFileParser);

    mockLogger = new Logger() as jest.Mocked<Logger>;
    (Logger as jest.Mock).mockImplementation(() => mockLogger);

    mockRepository = new Repository("", "", "") as jest.Mocked<Repository>;
    (Repository as jest.Mock).mockImplementation(() => mockRepository);

    mockOctokit = createMockOctokit();

    // Instantiate Main with mocked dependencies
    mainInstance = new Main();
    // Optionally, inject mockOctokit if Main's constructor is updated to accept it
    // mainInstance = new Main(mockOctokit);
  });

  test("parseUrlFile should fetch and concatenate npm and GitHub repos", async () => {
    const mockNpmRepos: RepositoryUrlData[] = [
      { url: "npm-url-1", owner: "npm-owner-1", name: "npm-repo-1" },
      { url: "npm-url-2", owner: "npm-owner-2", name: "npm-repo-2" },
    ];

    const mockGithubRepos: RepositoryUrlData[] = [
      { url: "github-url-1", owner: "github-owner-1", name: "github-repo-1" },
    ];

    mockUrlFileParser.npmRepos.mockResolvedValueOnce(mockNpmRepos);
    mockUrlFileParser.githubRepos.mockResolvedValueOnce(mockGithubRepos);

    const result = await mainInstance.parseUrlFile();

    expect(mockLogger.add).toHaveBeenCalledWith(2, "Parsing URL_FILE...");
    expect(mockUrlFileParser.npmRepos).toHaveBeenCalledTimes(1);
    expect(mockUrlFileParser.githubRepos).toHaveBeenCalledTimes(1);
    expect(mockLogger.add).toHaveBeenCalledWith(2, "URL_FILE successfully parsed\n");
    expect(result).toEqual([...mockNpmRepos, ...mockGithubRepos]);
  });

  test("run should execute main logic and return output", async () => {
    const mockRepoData: RepositoryUrlData[] = [
      { url: "url-1", owner: "owner-1", name: "repo-1" },
      { url: "url-2", owner: "owner-2", name: "repo-2" },
    ];

    mockUrlFileParser.npmRepos.mockResolvedValueOnce([mockRepoData[0]]);
    mockUrlFileParser.githubRepos.mockResolvedValueOnce([mockRepoData[1]]);

    // Mock repository creation and methods
    mockRepository.calculateAllMetrics.mockResolvedValueOnce();
    mockRepository.calculateAllMetrics.mockResolvedValueOnce();
    mockRepository.jsonMetrics.mockReturnValueOnce('{"repo": "repo-1", "metrics": {}}');
    mockRepository.jsonMetrics.mockReturnValueOnce('{"repo": "repo-2", "metrics": {}}');

    const output = await mainInstance.run();

    expect(mockLogger.add).toHaveBeenCalledWith(2, "Parsing URL_FILE...");
    expect(mockUrlFileParser.npmRepos).toHaveBeenCalledTimes(1);
    expect(mockUrlFileParser.githubRepos).toHaveBeenCalledTimes(1);
    expect(mockLogger.add).toHaveBeenCalledWith(2, "URL_FILE successfully parsed\n");

    // Check repository creation
    expect(Repository).toHaveBeenCalledTimes(2);
    expect(mockRepository.calculateAllMetrics).toHaveBeenCalledTimes(2);
    expect(mockRepository.jsonMetrics).toHaveBeenCalledTimes(2);

    // Check output
    expect(output).toBe('{"repo": "repo-1", "metrics": {}}{"repo": "repo-2", "metrics": {}}');

    // Check logging of start and end times
    expect(mockLogger.add).toHaveBeenCalledWith(expect.any(Number), expect.stringContaining("Start time:"));
    expect(mockLogger.add).toHaveBeenCalledWith(expect.any(Number), expect.stringContaining("End time"));
    expect(mockLogger.add).toHaveBeenCalledWith(expect.any(Number), expect.stringContaining("Total program run time"));
  });
});
