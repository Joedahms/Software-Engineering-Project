import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Main } from '../src/main';
import { UrlFileParser } from '../src/urlFileParser';
jest.mock('../src/urlFileParser');
describe('Main', () => {
    let main;
    let mockUrlFileParser;
    beforeEach(() => {
        mockUrlFileParser = new UrlFileParser();
        main = new Main();
        main.urlFileParser = mockUrlFileParser;
    });
    it('should parse URL file and return repository URL data', async () => {
        const npmRepos = [
            { url: 'https://npmjs.com/package1', owner: 'owner1', name: 'package1' },
            { url: 'https://npmjs.com/package2', owner: 'owner2', name: 'package2' }
        ];
        const githubRepos = [
            { url: 'https://github.com/owner3/repo3', owner: 'owner3', name: 'repo3' },
            { url: 'https://github.com/owner4/repo4', owner: 'owner4', name: 'repo4' }
        ];
        mockUrlFileParser.npmRepos.mockResolvedValue(npmRepos);
        mockUrlFileParser.githubRepos.mockReturnValue(githubRepos);
        const result = await main.parseUrlFile();
        expect(result).toEqual([...npmRepos, ...githubRepos]);
    });
});
