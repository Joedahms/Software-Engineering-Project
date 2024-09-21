import { describe, it, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import { Repository } from '../src/repository.js';
import { Url, NetScore, RampUp, Correctness, BusFactor, ResponsiveMaintainer, License } from '../src/metric.js';
import { RepoStats } from '../src/api_access.js';

jest.mock('../src/metric.js');
jest.mock('../src/api_access.js');

describe('Repository', () => {
  let repository: Repository;
  let mockRepoStats: jest.Mocked<RepoStats>;

  beforeEach(() => {
    mockRepoStats = new RepoStats('owner', 'repo') as jest.Mocked<RepoStats>;
    repository = new Repository('https://github.com/owner/repo', 'owner', 'repo');
    repository.repoStats = mockRepoStats;
  });

  it('should initialize with correct values', () => {
    expect(repository.owner).toBe('owner');
    expect(repository.name).toBe('repo');
    expect(repository.desiredLicense).toBe('MIT License');
    expect(repository.url.value).toBe('https://github.com/owner/repo');
  });

  it('should calculate all metrics', async () => {
    mockRepoStats.fetchRepoData.mockResolvedValue();
    mockRepoStats.fetchData.mockResolvedValue();
    mockRepoStats.readmeLength = 1000;
    mockRepoStats.totalCommits = 100;
    mockRepoStats.daysActive = 90;
    mockRepoStats.licenseName = 'MIT License';

    await repository.calculateAllMetrics();

    expect(repository.rampUp.value).toBeGreaterThan(0);
    expect(repository.correctness.value).toBe(0); // Assuming no calculation logic is provided
    expect(repository.busFactor.value).toBe(0); // Assuming no calculation logic is provided
    expect(repository.responsiveMaintainer.value).toBeGreaterThan(0);
    expect(repository.license.value).toBe(1);
    expect(repository.netScore.value).toBeGreaterThan(0);
  });

  it('should return correct JSON metrics', () => {
    repository.url.value = 'https://github.com/owner/repo';
    repository.netScore.value = 0.8;
    repository.rampUp.value = 0.7;
    repository.correctness.value = 0.6;
    repository.busFactor.value = 0.5;
    repository.responsiveMaintainer.value = 0.4;
    repository.license.value = 1;
    repository.netScore.latencyValue = 100;
    repository.rampUp.latencyValue = 200;
    repository.correctness.latencyValue = 300;
    repository.busFactor.latencyValue = 400;
    repository.responsiveMaintainer.latencyValue = 500;
    repository.license.latencyValue = 600;

    const expectedJson = JSON.stringify({
      URL: 'https://github.com/owner/repo',
      NetScore: 0.8,
      RampUp: 0.7,
      Correctness: 0.6,
      BusFactor: 0.5,
      ResponsiveMaintainer: 0.4,
      License: 1,
      netscore_latency: 100,
      rampup_latency: 200,
      correctness_latency: 300,
      busfactor_latency: 400,
      responsiveMaintainer_latency: 500,
      license_latency: 600
    }) + '\n';

    expect(repository.jsonMetrics()).toBe(expectedJson);
  });
});
