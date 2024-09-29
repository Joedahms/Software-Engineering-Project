import { UrlFileParser, RepositoryUrlData } from '../src/urlFileParser';
import * as filesystem from 'node:fs';
import * as cheerio from 'cheerio';
import { Logger } from '../src/logger';

jest.mock('node:fs'); // Mock the filesystem module
jest.mock('cheerio'); // Mock the cheerio module
jest.mock('./__mocks__/NoOpLogger.js'); // Mock the Logger class

describe('UrlFileParser', () => {
  let mockLogger: jest.Mocked<Logger>;
  let urlFileParser: UrlFileParser;

  beforeEach(() => {
    // Mock the Logger and its methods
    mockLogger = new Logger() as jest.Mocked<Logger>;
    mockLogger.clear = jest.fn();
    mockLogger.add = jest.fn();

    // Mock the filesystem readFileSync to return a mock URL file content
    (filesystem.readFileSync as jest.Mock).mockReturnValue(Buffer.from('https://github.com/test-owner/test-repo\nhttps://npmjs.com/package1\n'));

    // Create an instance of UrlFileParser
    urlFileParser = new UrlFileParser();
  });

  test('constructor should initialize properties and read file contents', () => {
    // Check that logger.clear() was called
    expect(mockLogger.clear).toHaveBeenCalled();

    // Check if the URL_FILE contents are correctly read
    expect(filesystem.readFileSync).toHaveBeenCalledWith(process.argv[2]);
    expect(urlFileParser.allUrlFileContents()).toBe('https://github.com/test-owner/test-repo\nhttps://npmjs.com/package1\n');
  });

  test('allUrlFileContents should return the correct file content', () => {
    const content = urlFileParser.allUrlFileContents();
    expect(content).toBe('https://github.com/test-owner/test-repo\nhttps://npmjs.com/package1\n');
  });

  test('githubRepos should return parsed GitHub URLs and repo data', () => {
    const mockGithubUrls = [
      'https://github.com/test-owner/test-repo',
      'https://github.com/another-owner/another-repo'
    ];

    // Mock the urlFileContents to contain GitHub URLs
    (filesystem.readFileSync as jest.Mock).mockReturnValue(Buffer.from(mockGithubUrls.join('\n')));
    urlFileParser = new UrlFileParser();

    // Run githubRepos
    const repos = urlFileParser.githubRepos();

    expect(mockLogger.add).toHaveBeenCalledWith(2, 'Searching for GitHub URLs from URL_FILE...');
    expect(repos).toEqual([
      { url: 'https://github.com/test-owner/test-repo', owner: 'test-owner', name: 'test-repo' },
      { url: 'https://github.com/another-owner/another-repo', owner: 'another-owner', name: 'another-repo' }
    ]);
    expect(mockLogger.add).toHaveBeenCalledWith(2, '2 GitHub URLs found');
  });

  test('npmRepos should return parsed GitHub URLs from NPM pages', async () => {
    const mockNpmUrls = ['https://npmjs.com/package1'];
    const mockHtml = '<div class="_702d723c"><a href="https://github.com/npm-owner/npm-repo"></a></div>';
    
    // Mock urlFileContents to contain NPM URLs
    (filesystem.readFileSync as jest.Mock).mockReturnValue(Buffer.from(mockNpmUrls.join('\n')));
    urlFileParser = new UrlFileParser();

    // Mock cheerio to extract GitHub URLs from the NPM pages
    (cheerio.load as jest.Mock).mockReturnValue({
      extract: jest.fn(() => ({
        class: ['https://github.com/npm-owner/npm-repo']
      }))
    });

    // Mock fetch to return mock HTML for the NPM pages
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(mockHtml),
      } as Response)
    );

    // Run npmRepos
    const repos = await urlFileParser.npmRepos();

    expect(repos).toEqual([
      { url: 'https://npmjs.com/package1', owner: 'npm-owner', name: 'npm-repo' }
    ]);
    expect(mockLogger.add).toHaveBeenCalledWith(2, '1 NPM URLs found');
  });

  test('npmRepos should handle no NPM URLs in file', async () => {
    // Mock urlFileContents with no NPM URLs
    (filesystem.readFileSync as jest.Mock).mockReturnValue(Buffer.from('https://github.com/test-owner/test-repo'));
    urlFileParser = new UrlFileParser();

    const repos = await urlFileParser.npmRepos();

    expect(repos).toEqual([]); // Expect empty array when no NPM URLs are found
    expect(mockLogger.add).toHaveBeenCalledWith(1, 'No NPM URLs in passed file');
  });
});
