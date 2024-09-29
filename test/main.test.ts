import { Main } from '../src/main.js';
import { UrlFileParser } from '../src/urlFileParser.js';
import { Repository } from '../src/repository.js';
import { Logger } from '../src/logger.js';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../src/urlFileParser.js'); // Mock UrlFileParser
jest.mock('../src/repository.js');     // Mock Repository
jest.mock('../src/logger.js');        // Mock Logger

describe('Main Class', () => {
  let mainInstance: Main;
  let mockUrlFileParser: jest.Mocked<UrlFileParser>;
  let mockLogger: jest.Mocked<Logger>;
  let mockRepositoryInstance: jest.Mocked<Repository>;
  let MockedRepository: jest.MockedClass<typeof Repository>;

  beforeAll(() => {
    // Ensure that Repository is treated as a mocked class
    MockedRepository = Repository as jest.MockedClass<typeof Repository>;
  });

  beforeEach(() => {
    jest.resetAllMocks();

    // Initialize mocked Logger
    mockLogger = new Logger() as jest.Mocked<Logger>;
    mockLogger.add = jest.fn();
    mockLogger.clear = jest.fn();
    // mockLogger.fileName = 'mockFile.log';
    // mockLogger.level = 1;

    // Ensure Logger mock is used when new Logger() is called
    (Logger as jest.Mock).mockImplementation(() => mockLogger);

    // Initialize mocked UrlFileParser
    mockUrlFileParser = new UrlFileParser() as jest.Mocked<UrlFileParser>;
    mockUrlFileParser.npmRepos = jest.fn();
    mockUrlFileParser.githubRepos = jest.fn();

    // Initialize Main instance
    mainInstance = new Main();
  });

  test('should log the start time when the program starts', () => {
    // Assuming that Main's constructor logs the start time
    const startTimeRegex = /Start time: \d+\.?\d* milliseconds/;
    expect(mockLogger.add).toHaveBeenCalledWith(expect.any(Number), expect.stringMatching(startTimeRegex));
  });

  test('should parse URLs correctly and log the parsing', async () => {
    const mockRepoData = [
      { url: 'https://github.com/test-owner/test-repo', owner: 'test-owner', name: 'test-repo' },
    ];

    // Mock UrlFileParser methods to return repository data
    mockUrlFileParser.npmRepos.mockResolvedValueOnce([]);
    mockUrlFileParser.githubRepos.mockReturnValueOnce(mockRepoData);

    const parsedUrls = await mainInstance.parseUrlFile();

    // Ensure logger logs parsing information
    expect(mockLogger.add).toHaveBeenCalledWith(2, 'Parsing URL_FILE...');
    expect(mockLogger.add).toHaveBeenCalledWith(2, 'URL_FILE successfully parsed\n');

    // Ensure URLs are parsed correctly
    expect(parsedUrls).toEqual(mockRepoData);
  });

  test('should create repositories and calculate metrics correctly', async () => {
    const mockRepoData = [
      { url: 'https://github.com/test-owner/test-repo', owner: 'test-owner', name: 'test-repo' },
    ];

    // Mock UrlFileParser methods to return repository data
    mockUrlFileParser.npmRepos.mockResolvedValueOnce([]);
    mockUrlFileParser.githubRepos.mockReturnValueOnce(mockRepoData);

    // Mock repository instance and metrics calculation
    mockRepositoryInstance = {
      calculateAllMetrics: jest.fn(),
      jsonMetrics: jest.fn().mockReturnValueOnce('{"repo": "test-repo", "metrics": {}}'),
    } as unknown as jest.Mocked<Repository>;

    // Mock the Repository constructor to return the mocked instance
    MockedRepository.mockImplementation(() => mockRepositoryInstance);

    // Run the main method to parse and process repositories
    const parsedUrls = await mainInstance.parseUrlFile();
    const repositories: Repository[] = [];

    for (const data of parsedUrls) {
      const repo = new Repository(data.url, data.owner, data.name);
      await repo.calculateAllMetrics();
      repositories.push(repo);
    }

    expect(repositories.length).toBe(1);
    expect(mockRepositoryInstance.calculateAllMetrics).toHaveBeenCalled();
  });

  test('should print out metric calculation results in NDJSON format', async () => {
    const mockRepoData = [
      { url: 'https://github.com/test-owner/test-repo', owner: 'test-owner', name: 'test-repo' },
    ];

    // Mock UrlFileParser methods to return repository data
    mockUrlFileParser.npmRepos.mockResolvedValueOnce([]);
    mockUrlFileParser.githubRepos.mockReturnValueOnce(mockRepoData);

    // Mock repository instance and metrics calculation
    mockRepositoryInstance = {
      calculateAllMetrics: jest.fn(),
      jsonMetrics: jest.fn()
    } as unknown as jest.Mocked<Repository>;

    // Mock the Repository constructor to return the mocked instance
    MockedRepository.mockImplementation(() => mockRepositoryInstance);

    const parsedUrls = await mainInstance.parseUrlFile();
    const repositories: Repository[] = [];

    for (const data of parsedUrls) {
      const repo = new Repository(data.url, data.owner, data.name);
      await repo.calculateAllMetrics();
      repositories.push(repo);
    }

    // Concatenate repository metrics in NDJSON format
    let output = '';
    for (const repo of repositories) {
      output += repo.jsonMetrics();
    }

    expect(output).toContain('{"repo": "test-repo", "metrics": {}}');
  });

  test('should log the end time and total runtime when the program ends', () => {
    // Assuming that Main's method logs the end time and runtime
    const endTimeRegex = /End time \d+\.?\d* milliseconds/;
    const runtimeRegex = /Total program run time: \d+\.?\d* seconds/;

    expect(mockLogger.add).toHaveBeenCalledWith(expect.any(Number), expect.stringMatching(endTimeRegex));
    expect(mockLogger.add).toHaveBeenCalledWith(1, expect.stringMatching(runtimeRegex));
    expect(mockLogger.add).toHaveBeenCalledWith(2, expect.stringMatching(runtimeRegex));
  });
});
