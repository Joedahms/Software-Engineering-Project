import { describe, it, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import * as filesystem from 'node:fs';
import * as cheerio from 'cheerio';
import { UrlFileParser, RepositoryUrlData } from '../src/urlFileParser';
import { Logger } from '../src/logger.js';
import { writeOutput } from '../src/output.js';

jest.mock('node:fs');
jest.mock('cheerio');
jest.mock('../src/logger.js');
jest.mock('../src/output.js');

describe('UrlFileParser', () => {
  let urlFileParser: UrlFileParser;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = new Logger() as jest.Mocked<Logger>;
    urlFileParser = new UrlFileParser();
    urlFileParser.logger = mockLogger;
  });

  it('should initialize with correct values', () => {
    expect(urlFileParser.npmRegex).toEqual(new RegExp("^.*npmjs.*$", "gm"));
    expect(urlFileParser.githubRegex).toEqual(new RegExp("^.*github.*$", "gm"));
    expect(urlFileParser.ownerAndNameRegex).toEqual(new RegExp("(?<=com\/).*?(?=$)", "gm"));
    expect(urlFileParser.ownerRegex).toEqual(new RegExp(".*?(?=\/)", "gm"));
    expect(urlFileParser.nameRegex).toEqual(new RegExp("(?<=\/).*?(?=$)", "gm"));
  });

  it('should return all URL file contents', () => {
    const urlFileContents = 'https://github.com/owner/repo\nhttps://npmjs.com/package';
    (filesystem.readFileSync as jest.Mock).mockReturnValue(Buffer.from(urlFileContents, 'utf8'));
    const result = urlFileParser.allUrlFileContents();
    expect(result).toBe(urlFileContents);
  });

  it('should parse GitHub URLs correctly', () => {
    const urlFileContents = 'https://github.com/owner/repo\nhttps://github.com/owner2/repo2';
    (filesystem.readFileSync as jest.Mock).mockReturnValue(Buffer.from(urlFileContents, 'utf8'));
    const result = urlFileParser.githubRepos();
    expect(result).toEqual([
      { url: 'https://github.com/owner/repo', owner: 'owner', name: 'repo' },
      { url: 'https://github.com/owner2/repo2', owner: 'owner2', name: 'repo2' }
    ]);
  });

  it('should parse NPM URLs correctly', async () => {
    const urlFileContents = 'https://npmjs.com/package1\nhttps://npmjs.com/package2';
    (filesystem.readFileSync as jest.Mock).mockReturnValue(Buffer.from(urlFileContents, 'utf8'));
    (cheerio.load as jest.Mock).mockReturnValue({
      extract: jest.fn().mockReturnValue({ class: ['https://github.com/owner/repo'] })
    });

    const result = await urlFileParser.npmRepos();
    expect(result).toEqual([
      { url: 'https://npmjs.com/package1', owner: 'owner', name: 'repo' },
      { url: 'https://npmjs.com/package2', owner: 'owner', name: 'repo' }
    ]);
  });
});
