import { describe, it, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import { fetchCommitCount, checkLicense, RepoStats } from '../src/api_access';
import { Logger } from '../src/logger.js';
//import mockOctokit from '@octokit/rest';
//import { Octokit } from "@octokit/rest";

jest.mock('@octokit/rest');
jest.mock('./logger.js');

mockOctokit.get.mockResolvedValue(() => Promise.resolve())
//const mockOctokit = Octokit as jest.MockedClass<typeof Octokit>;
const mockLogger = Logger as jest.MockedClass<typeof Logger>;

describe('GitHub API Functions', () => {
  let octokitInstance: jest.Mocked<Octokit>;
  let loggerInstance: jest.Mocked<Logger>;

  beforeEach(() => {
    octokitInstance = new mockOctokit();
    loggerInstance = new mockLogger();

    // Mock the methods of Logger
    loggerInstance.add = jest.fn();
    loggerInstance.clear = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCommitCount', () => {
    it('should return the number of commits', async () => {
      const owner = 'owner';
      const repo = 'repo';
      const mockResponse = {
        headers: {
          link: '<https://api.github.com/repositories/123456789/commits?page=2>; rel="next", <https://api.github.com/repositories/123456789/commits?page=10>; rel="last"'
        },
        data: [{}, {}]
      };
      octokitInstance.repos.listCommits.mockResolvedValue(mockResponse);

      const result = await fetchCommitCount(owner, repo);
      expect(result).toBe(10);
    });

    it('should return 0 if an error occurs', async () => {
      const owner = 'owner';
      const repo = 'repo';
      octokitInstance.repos.listCommits.mockRejectedValue(new Error('Error'));

      const result = await fetchCommitCount(owner, repo);
      expect(result).toBe(0);
    });
  });

  describe('checkLicense', () => {
    it('should return the license name', async () => {
      const owner = 'owner';
      const repo = 'repo';
      const mockResponse = {
        data: {
          license: {
            name: 'MIT'
          }
        }
      };
      octokitInstance.request.mockResolvedValue(mockResponse);

      const result = await checkLicense(owner, repo);
      expect(result).toBe('MIT');
    });

    it('should return " " if the repository has no license', async () => {
      const owner = 'owner';
      const repo = 'repo';
      octokitInstance.request.mockRejectedValue({ status: 404 });

      const result = await checkLicense(owner, repo);
      expect(result).toBe(' ');
    });
  });

  describe('RepoStats', () => {
    it('should fetch and set repository data', async () => {
      const owner = 'owner';
      const repo = 'repo';
      const repoStats = new RepoStats(owner, repo);

      const mockRepoData = {
        data: {
          created_at: '2020-01-01T00:00:00Z',
          updated_at: '2020-01-10T00:00:00Z',
          forks_count: 5
        }
      };
      octokitInstance.repos.get.mockResolvedValue(mockRepoData);

      await repoStats.fetchRepoData();
      expect(repoStats.daysActive).toBe(9);
    });

    it('should fetch and set total commits', async () => {
      const owner = 'owner';
      const repo = 'repo';
      const repoStats = new RepoStats(owner, repo);

      jest.spyOn(repoStats, 'fetchTotalCommits').mockResolvedValue(10);

      await repoStats.fetchTotalCommits();
      expect(repoStats.totalCommits).toBe(10);
    });
  });
});
