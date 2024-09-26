import { describe, it, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import { Main } from '../src/main';
import { UrlFileParser } from '../src/urlFileParser';
import { Logger } from '../src/logger';
import { Repository } from '../src/repository';

jest.mock('./urlFileParser');
jest.mock('./logger');
jest.mock('./repository');

describe('Main', () => {
  let main: Main;
  let mockUrlFileParser: jest.Mocked<UrlFileParser>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockUrlFileParser = new UrlFileParser() as jest.Mocked<UrlFileParser>;
    mockLogger = new Logger() as jest.Mocked<Logger>;
    main = new Main(mockUrlFileParser, mockLogger);
    process.env.LOG_LEVEL = '1';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should parse the URL file and return repository data', async () => {
    const mockRepositoryUrlData = [
      { url: 'https://github.com/user/repo1', owner: 'user', name: 'repo1' },
      { url: 'https://github.com/user/repo2', owner: 'user', name: 'repo2' },
    ];
    mockUrlFileParser.npmRepos.mockResolvedValue([]);
    mockUrlFileParser.githubRepos.mockResolvedValue(mockRepositoryUrlData);

    const result = await main.parseUrlFile();

    expect(mockLogger.add).toHaveBeenCalledWith(2, 'Parsing URL_FILE...');
    expect(mockLogger.add).toHaveBeenCalledWith(2, 'URL_FILE successfully parsed');
    expect(result).toEqual(mockRepositoryUrlData);
  });

  it('should create repository objects and calculate metrics', async () => {
    const mockRepositoryUrlData = [
      { url: 'https://github.com/user/repo1', owner: 'user', name: 'repo1' },
      { url: 'https://github.com/user/repo2', owner: 'user', name: 'repo2' },
    ];
    mockUrlFileParser.npmRepos.mockResolvedValue([]);
    mockUrlFileParser.githubRepos.mockResolvedValue(mockRepositoryUrlData);

    const mockRepository = new Repository('https://github.com/user/repo1', 'user', 'repo1') as jest.Mocked<Repository>;
    mockRepository.calculateAllMetrics.mockResolvedValue();
    mockRepository.jsonMetrics.mockReturnValue('{}');
    Repository.mockImplementation(() => mockRepository);

    const urlData = await main.parseUrlFile();
    const repositories: Repository[] = [];

    for (const data of urlData) {
      const repo = new Repository(data.url, data.owner, data.name);
      await repo.calculateAllMetrics();
      repositories.push(repo);
    }

    expect(repositories.length).toBe(2);
    expect(mockRepository.calculateAllMetrics).toHaveBeenCalledTimes(2);
  });
});