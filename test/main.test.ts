import { Main } from '../src/main';
import { UrlFileParser } from '../src/urlFileParser';
import { Repository } from '../src/repository';
import { Logger } from '../src/logger';

jest.mock('../src/urlFileParser'); // Mock UrlFileParser
jest.mock('../src/repository'); // Mock Repository
jest.mock('../src/logger'); // Mock Logger

describe('Main Class', () => {
  let mainInstance: Main;
  let mockUrlFileParser: jest.Mocked<UrlFileParser>;
  let mockLogger: jest.Mocked<Logger>;
  let mockRepositoryInstance: jest.Mocked<Repository>;

  beforeEach(() => {
    mainInstance = new Main();
    mockUrlFileParser = mainInstance.urlFileParser as jest.Mocked<UrlFileParser>;
    mockLogger = mainInstance.logger as jest.Mocked<Logger>;

    // Mock the logger methods
    mockLogger.add = jest.fn();

    // Mock repository methods after instantiating Repository
    mockRepositoryInstance = new Repository('mockUrl', 'mockOwner', 'mockName') as jest.Mocked<Repository>;
    mockRepositoryInstance.calculateAllMetrics = jest.fn().mockResolvedValueOnce(undefined);
    mockRepositoryInstance.jsonMetrics = jest.fn().mockReturnValueOnce('{"repo": "test-repo", "metrics": {}}');
  });

  test('should log the start time when the program starts', () => {
    const startTime = performance.now();
    expect(mockLogger.add).toHaveBeenCalledWith(2, `Start time: ${startTime} milliseconds`);
  });

  test('should parse URLs correctly and log the parsing', async () => {
    const mockRepoData = [
      { url: 'https://github.com/test-owner/test-repo', owner: 'test-owner', name: 'test-repo' },
    ];

    // Mock URL parser methods to return repository data
    mockUrlFileParser.npmRepos.mockResolvedValueOnce([]);
    mockUrlFileParser.githubRepos();

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

    // Mock URL parser methods to return repository data
    mockUrlFileParser.npmRepos.mockResolvedValueOnce([]);
    mockUrlFileParser.githubRepos();

    // Mock repository instance and metrics calculation
    Repository.mockImplementation(() => mockRepositoryInstance);

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

    // Mock URL parser methods to return repository data
    mockUrlFileParser.npmRepos.mockResolvedValueOnce([]);
    mockUrlFileParser.githubRepos();

    // Mock repository instance and metrics calculation
    Repository.mockImplementation(() => mockRepositoryInstance);

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
    const endTime = performance.now();
    const startTime = performance.now();
    const runtime = (endTime - startTime) / 1000;

    expect(mockLogger.add).toHaveBeenCalledWith(2, `End time ${endTime} milliseconds`);
    expect(mockLogger.add).toHaveBeenCalledWith(1, `Total program run time: ${runtime} seconds`);
    expect(mockLogger.add).toHaveBeenCalledWith(2, `Total program run time: ${runtime} seconds`);
  });
});
