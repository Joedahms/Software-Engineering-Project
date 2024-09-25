import { RepoStats } from '../src/api_access';
import { Logger } from '../src/logger.js';
import { Octokit } from '@octokit/rest';

jest.mock('@octokit/rest');
jest.mock('./logger.js', () => {
  return {
    Logger: jest.fn().mockImplementation(() => {
      return {
        add: jest.fn(),
      };
    }),
  };
});

describe("API functions", () => {
  it("Calls getContents once", async () => {
    const result = await RepoStats
    expect(octomock.mockFunctions.repos.getContents).toHaveBeenCalledTimes(1);
    })
  })

describe('GitHub API functions', () => {
  let mockOctokit;
  const owner = 'octocat';
  const repo = 'Hello-World';

  beforeEach(() => {
    // Create a mock Octokit instance
    mockOctokit = new Octomock();
  });

  describe('RepoStats class', () => {
    it('should fetch license name correctly', async () => {
      // Mocking the response for license request
      mockOctokit.request('GET /repos/{owner}/{repo}/license', {
        owner,
        repo,
      }).reply(200, {
        license: { name: 'MIT License' },
      });

      const repoStats = new RepoStats(owner, repo);
      const licenseName = await repoStats.#getLicenseName(owner, repo); // Use private method testing approach if needed

      expect(licenseName).toBe('MIT License');
    });

    it('should return "N/A" for license if no license found (404 error)', async () => {
      // Mocking a 404 error for license request
      mockOctokit.request('GET /repos/{owner}/{repo}/license', {
        owner,
        repo,
      }).reply(404);

      const repoStats = new RepoStats(owner, repo);
      const licenseName = await repoStats.#getLicenseName(owner, repo);

      expect(licenseName).toBe('N/A');
    });

    it('should fetch the total commit count', async () => {
      // Mocking the response for commit count
      mockOctokit.repos.listCommits({
        owner,
        repo,
        per_page: 1,
      }).reply(200, [{ sha: 'abc123' }], {
        link: '<https://api.github.com/repos/octocat/Hello-World/commits?page=2>; rel="last"',
      });

      const repoStats = new RepoStats(owner, repo);
      const commitCount = await repoStats.#getCommitCount(owner, repo);

      expect(commitCount).toBe(2); // Based on mock link header
    });

    it('should return 0 commit count if there is an error', async () => {
      // Mocking a failed commit count response
      mockOctokit.repos.listCommits({
        owner,
        repo,
        per_page: 1,
      }).reply(500);

      const repoStats = new RepoStats(owner, repo);
      const commitCount = await repoStats.#getCommitCount(owner, repo);

      expect(commitCount).toBe(0);
    });

    it('should fetch and decode the README correctly', async () => {
      // Mocking the response for README
      mockOctokit.repos.getReadme({
        owner,
        repo,
      }).reply(200, {
        content: Buffer.from('This is the README file.').toString('base64'),
      });

      const repoStats = new RepoStats(owner, repo);
      await repoStats.getData();

      expect(repoStats.readme).toBe('This is the README file.');
      expect(repoStats.readmeLength).toBe(23); // Length of 'This is the README file.'
    });

    it('should handle rate limit exceeded error', async () => {
      const rateLimitExceededError = {
        status: 403,
        response: {
          headers: {
            'x-ratelimit-remaining': '0',
            'retry-after': '60',
          },
        },
      };

      const spyHandleError = jest.spyOn(global.console, 'error').mockImplementation(() => {});
      const repoStats = new RepoStats(owner, repo);

      // Simulate rate limit exceeded error
      repoStats.handleError(rateLimitExceededError);

      expect(spyHandleError).toHaveBeenCalledWith('Rate limit exceeded. Waiting before retrying.');
    });

    it('should fetch and display repo data correctly', async () => {
      // Mock the response for repo data (days active)
      mockOctokit.repos.get({
        owner,
        repo,
      }).reply(200, {
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-11T00:00:00Z',
      });

      const repoStats = new RepoStats(owner, repo);
      await repoStats.getRepoData();

      expect(repoStats.daysActive).toBe(10); // 10 days active based on mock data
    });

    it('should check the rate limit correctly', async () => {
      // Mock the response for rate limit
      mockOctokit.rateLimit.get().reply(200, {
        rate: { remaining: 5000, reset: Math.floor(Date.now() / 1000) + 3600 },
      });

      const consoleSpy = jest.spyOn(global.console, 'log');
      await checkRateLimit();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Remaining requests: 5000'));
    });
  });
});
