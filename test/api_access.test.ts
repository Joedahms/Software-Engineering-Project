import { RepoStats } from '../src/api_access'; // Replace with your actual file path
import { Octokit } from '@octokit/rest';
import mockOctokit from '@octokit/rest';

jest.mock('@octokit/rest', () => ({
  default: {
    get: jest.fn().mockResolvedValue({})
  }
}));

// Mock Logger to avoid actual logging in tests
jest.mock('./logger.js', () => {
  return {
    Logger: jest.fn().mockImplementation(() => {
      return {
        add: jest.fn(),
      };
    }),
  };
});

describe('GitHub API functions', () => {
  let mockOctokit;
  const owner = 'octocat';
  const repo = 'Hello-World';

  beforeEach(() => {
    // Use octomock to create a mock instance of Octokit
    mockOctokit = new Octomock();
  });

  describe('RepoStats', () => {
    it('should fetch repo data and set the correct days active', async () => {
      // Mock the response for repo data
      mockOctokit.repos.get({
        owner,
        repo,
      }).reply(200, {
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-11T00:00:00Z',
      });

      const repoStats = new RepoStats(owner, repo);
      await repoStats.fetchRepoData();

      expect(repoStats.daysActive).toBe(10
      );
    });

    it('should fetch commit count and update the totalCommits property', async () => {
      // Mock the response for fetchCommitCount
      mockOctokit.repos.listCommits({
        owner,
        repo,
        per_page: 1,
      }).reply(200, [{ sha: 'abc123' }]);

      const repoStats = new RepoStats(owner, repo);
      await repoStats.fetchTotalCommits();

      expect(repoStats.totalCommits).toBe(1);
    });

    it('should fetch and set the license name', async () => {
      // Mock the license response
      mockOctokit.request('GET /repos/{owner}/{repo}/license', {
        owner,
        repo,
      }).reply(200, {
        license: { name: 'MIT License' },
      });

      const repoStats = new RepoStats(owner, repo);
      await repoStats.fetchData();

      expect(repoStats.licenseName).toBe('MIT License');
    });

    it('should fetch and set the readme length', async () => {
      // Mock the readme response with base64-encoded content
      mockOctokit.repos.getReadme({
        owner,
        repo,
      }).reply(200, {
        content: Buffer.from('This is the README file.').toString('base64'),
      });

      const repoStats = new RepoStats(owner, repo);
      await repoStats.fetchData();

      expect(repoStats.readmeLength).toBe(23); // "This is the README file." has 23 characters
    });
  });
});
