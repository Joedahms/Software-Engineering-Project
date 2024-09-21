import { describe, it, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import { Main } from '../src/main.js';
import { UrlFileParser, RepositoryUrlData } from '../src/urlFileParser.js';

jest.mock('../src/urlFileParser.js');

describe('Main', () => {
  let main: Main;
  let mockUrlFileParser: jest.Mocked<UrlFileParser>;

  beforeEach(() => {
    mockUrlFileParser = new UrlFileParser() as jest.Mocked<UrlFileParser>;
    main = new Main();
    main.urlFileParser = mockUrlFileParser;
  });

  it('should parse URL file and return repository URL data', async () => {
    const npmRepos: RepositoryUrlData[] = [
      { url: 'https://npmjs.com/package1', owner: 'owner1', name: 'package1' },
      { url: 'https://npmjs.com/package2', owner: 'owner2', name: 'package2' }
    ];
    const githubRepos: RepositoryUrlData[] = [
      { url: 'https://github.com/owner3/repo3', owner: 'owner3', name: 'repo3' },
      { url: 'https://github.com/owner4/repo4', owner: 'owner4', name: 'repo4' }
    ];

    mockUrlFileParser.npmRepos.mockResolvedValue(npmRepos);
    mockUrlFileParser.githubRepos.mockReturnValue(githubRepos);

    const result = await main.parseUrlFile();

    expect(result).toEqual([...npmRepos, ...githubRepos]);
  });
});
