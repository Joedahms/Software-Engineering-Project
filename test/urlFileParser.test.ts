import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as filesystem from 'node:fs';
import * as cheerio from 'cheerio';
import { UrlFileParser } from '../src/urlFileParser';
import { Logger } from '../src/logger';

jest.mock('node:fs');
jest.mock('cheerio');

describe('UrlFileParser', () => {
  let urlFileParser: UrlFileParser;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    process.argv[2] = 'mockFilePath';

    // Mock filesystem readFileSync
    (filesystem.readFileSync as jest.Mock).mockReturnValue(
      Buffer.from('https://github.com/owner/repo\nhttps://github.com/owner2/repo2\nhttps://npmjs.com/package1\nhttps://npmjs.com/package2', 'utf8')
    );

    // Mock Logger
    mockLogger = {
      add: jest.fn(),
      clear: jest.fn(),
      fileName: 'mockFile.log',
      level: 1,
    } as jest.Mocked<Logger>;

    // Create UrlFileParser instance
    urlFileParser = new UrlFileParser();
    urlFileParser.logger = mockLogger;

    // Mock global fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve('<div class="_702d723c">https://github.com/owner/repo</div>'),
      } as Response)
    );

    // Mock cheerio.load
    (cheerio.load as jest.Mock).mockImplementation(() => {
      return (selector: string) => {
        return {
          text: jest.fn(() => 'https://github.com/owner/repo'),
        };
      };
    });
  });

  it('should initialize with correct values', () => {
    expect(urlFileParser.npmRegex).toEqual(new RegExp("^.*npmjs.*$", "gm"));
    expect(urlFileParser.githubRegex).toEqual(new RegExp("^.*github.*$", "gm"));
    expect(urlFileParser.ownerAndNameRegex).toEqual(new RegExp("(?<=com\\/).*?(?=$)", "gm"));
    expect(urlFileParser.ownerRegex).toEqual(new RegExp(".*?(?=\\/)", "gm"));
    expect(urlFileParser.nameRegex).toEqual(new RegExp("(?<=\\/).*?(?=$)", "gm"));
  });

  it('should return all URL file contents', () => {
    const urlFileContents = 'https://github.com/owner/repo\nhttps://github.com/owner2/repo2\nhttps://npmjs.com/package1\nhttps://npmjs.com/package2';
    (filesystem.readFileSync as jest.Mock).mockReturnValue(Buffer.from(urlFileContents, 'utf8'));
  
    const result = urlFileParser.allUrlFileContents();
    expect(result).toBe(urlFileContents);
  });

  it('should parse GitHub URLs correctly', () => {
    const urlFileContents = 'https://github.com/owner/repo\nhttps://github.com/owner2/repo2';
    (filesystem.readFileSync as jest.Mock).mockReturnValue(Buffer.from(urlFileContents, 'utf8'));

    const result = urlFileParser.githubRepos();
    console.log('Parsed GitHub URLs:', result);

    expect(result).toEqual([
      { url: 'https://github.com/owner/repo', owner: 'owner', name: 'repo' },
      { url: 'https://github.com/owner2/repo2', owner: 'owner2', name: 'repo2' },
    ]);
  });

  it('should parse NPM URLs correctly', async () => {
    jest.setTimeout(10000); // Increase timeout for this test
    const urlFileContents = 'https://npmjs.com/package1\nhttps://npmjs.com/package2';
    (filesystem.readFileSync as jest.Mock).mockReturnValue(Buffer.from(urlFileContents, 'utf8'));

    const result = await urlFileParser.npmRepos();
    console.log('Parsed NPM URLs:', result);

    expect(result).toEqual([
      { url: 'https://npmjs.com/package1', owner: 'owner', name: 'repo' },
      { url: 'https://npmjs.com/package2', owner: 'owner', name: 'repo' },
    ]);
  });
});
