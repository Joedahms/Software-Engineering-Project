import { Main } from "../src/main";
import { UrlFileParser, RepositoryUrlData } from "../src/urlFileParser";
import { Logger } from "../src/logger";
import { Repository } from "../src/repository";
import { run } from "node:test";

// Mock dependencies
jest.mock("../src/urlFileParser");
jest.mock("../src/logger");
jest.mock("../src/repository");

describe("Main Class", () => {
  let mainInstance: Main;
  let mockUrlFileParser: jest.Mocked<any>;
  let mockLogger: jest.Mocked<Logger>;
  let mockRepository: jest.Mocked<any>;

  beforeEach(() => {
    jest.resetAllMocks();

    // Initialize mocks
    mockUrlFileParser = require("../src/urlFileParser.js").UrlFileParser as jest.Mocked<any>;
    mockLogger = new Logger() as jest.Mocked<Logger>;
    (Logger as jest.Mock).mockImplementation(() => mockLogger);
    mockRepository = require("../src/repository.js").Repository as jest.Mocked<any>;

    // Instantiate Main
    mainInstance = new Main();
  });

  test("parseUrlFile should fetch and concatenate npm and GitHub repos", async () => {
    const mockNpmRepos: RepositoryUrlData[] = [
      { url: "https://www.npmjs.com/package/express", owner: "npm-owner-1", name: "express" },
      { url: "https://www.npmjs.com/package/browserify", owner: "npm-owner-2", name: "browserify" },
    ];

    const mockGithubRepos: RepositoryUrlData[] = [
      { url: "https://github.com/cloudinary/cloudinary_npm", owner: "cloudinary", name: "cloudinary_npm" },
      { url: "https://github.com/nullivex/nodist", owner: "nullivex", name: "nodist" },
      { url: "https://github.com/lodash/lodash", owner: "lodash", name: "lodash" },
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
      { url: "https://www.npmjs.com/package/express", owner: "npm-owner-1", name: "express" },
      { url: "https://www.npmjs.com/package/browserify", owner: "npm-owner-2", name: "browserify" },
    ];

    mockUrlFileParser.npmRepos.mockResolvedValueOnce([mockRepoData[0]]);
    mockUrlFileParser.githubRepos.mockResolvedValueOnce([mockRepoData[1]]);

    // Mock repository creation and methods
    mockRepository.calculateAllMetrics.mockResolvedValueOnce();
    mockRepository.calculateAllMetrics.mockResolvedValueOnce();
    mockRepository.jsonMetrics.mockReturnValueOnce('{"repo": "express", "metrics": {}}');
    mockRepository.jsonMetrics.mockReturnValueOnce('{"repo": "browserify", "metrics": {}}');

    //const output = mainInstance./run();

    expect(mockLogger.add).toHaveBeenCalledWith(2, "Parsing URL_FILE...");
    expect(mockUrlFileParser.npmRepos).toHaveBeenCalledTimes(1);
    expect(mockUrlFileParser.githubRepos).toHaveBeenCalledTimes(1);
    expect(mockLogger.add).toHaveBeenCalledWith(2, "URL_FILE successfully parsed\n");

    // Check repository creation
    expect(Repository).toHaveBeenCalledTimes(2);
    expect(mockRepository.calculateAllMetrics).toHaveBeenCalledTimes(2);
    expect(mockRepository.jsonMetrics).toHaveBeenCalledTimes(2);

    // Check output
    //expect(output).toBe('{"repo": "express", "metrics": {}}{"repo": "browserify", "metrics": {}}');

    // Check logging of start and end times
    expect(mockLogger.add).toHaveBeenCalledWith(expect.any(Number), expect.stringContaining("Start time:"));
    expect(mockLogger.add).toHaveBeenCalledWith(expect.any(Number), expect.stringContaining("End time"));
    expect(mockLogger.add).toHaveBeenCalledWith(expect.any(Number), expect.stringContaining("Total program run time"));
  });
});
