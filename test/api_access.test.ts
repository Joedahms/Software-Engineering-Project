import { describe, it, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import { Octokit } from '@octokit/rest';
import { fetchCommitCount, checkLicense, RepoStats } from '../src/api_access';
import { Logger } from '../src/logger';

//jest.mock('@octokit/rest');
//jest.mock('../src/logger');

const mockedOctokit = Octokit as jest.MockedClass<typeof Octokit>;
const mockedLogger = Logger as jest.MockedClass<typeof Logger>;

describe('GitHub API Functions', () => {
  let octokit: any;

  beforeEach(() => {
    octokit = new mockedOctokit();
    octokit.paginate = jest.fn();
    octokit.repos = {
      listCommits: jest.fn(),
      get: jest.fn(),
      getReadme: jest.fn(),
    };
    octokit.request = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetchCommitCount should return the correct number of commits', async () => {
    const owner = 'owner';
    const repo = 'repo';
    const commits = [{ sha: 'commit1' }, { sha: 'commit2' }];
    octokit.repos.listCommits.mockResolvedValueOnce({ data: commits, headers: {} });

    const commitCount = await fetchCommitCount(owner, repo);
    expect(commitCount).toBe(commits.length);
  });

  test('checkLicense should return the correct license name', async () => {
    const owner = 'owner';
    const repo = 'repo';
    const licenseData = { license: { name: 'MIT' } };
    octokit.request.mockResolvedValueOnce({ data: licenseData });

    const licenseName = await checkLicense(owner, repo);
    expect(licenseName).toBe('MIT');
  });

  test('RepoStats should fetch and display repository statistics', async () => {
    const owner = 'owner';
    const repo = 'repo';
    const repoData = {
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-10T00:00:00Z',
      forks_count: 5,
    };
    const readmeData = { content: Buffer.from('README content').toString('base64') };
    const commits = [{ sha: 'commit1' }, { sha: 'commit2' }];
    const licenseData = { license: { name: 'MIT' } };

    octokit.repos.get.mockResolvedValueOnce({ data: repoData });
    octokit.repos.getReadme.mockResolvedValueOnce({ data: readmeData });
    octokit.repos.listCommits.mockResolvedValueOnce({ data: commits, headers: {} });
    octokit.request.mockResolvedValueOnce({ data: licenseData });

    const repoStats = new RepoStats(owner, repo);
    await repoStats.fetchRepoData();
    await repoStats.fetchTotalCommits();
    await repoStats.fetchRepoData();

    expect(repoStats.daysActive).toBe(9);
    expect(repoStats.totalCommits).toBe(commits.length);
    expect(repoStats.licenseName).toBe('MIT');
    expect(repoStats.readmeLength).toBe('README content'.length);
  });
});