import { describe, it, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
// __tests__/repository.test.ts
import { Repository } from '../src/repository';

describe('Repository Class', () => {
  let repository: Repository;

  beforeEach(() => {
    // Initialize a Repository instance with mock data
    repository = new Repository(
      'https://github.com/user/repo',
      'user',
      'repo'
    );
  });

  describe('calculateAllMetrics', () => {
    it('should calculate all metrics without errors', async () => {
      await expect(repository.calculateAllMetrics()).resolves.not.toThrow();

      // Check if metric values are set correctly (based on mocks)
      expect(repository.url.value).toBe('https://github.com/user/repo'); // From Url constructor
      expect(repository.netScore.value).toBe(100); // Mock value
      expect(repository.rampUp.value).toBe(0.5); // Mock value
      expect(repository.correctness.value).toBe(0.8); // Mock value
      expect(repository.busFactor.value).toBe(0.7); // Mock value
      expect(repository.responsiveMaintainer.value).toBe(0.9); // Mock value
      expect(repository.license.value).toBe(1); // Mock value
    });

    it('should set latency values after calculation', async () => {
      await repository.calculateAllMetrics();

      // Check that latency values are numbers (since mocked, they are 0)
      expect(typeof repository.netScore.latencyValue).toBe('number');
      expect(typeof repository.rampUp.latencyValue).toBe('number');
      expect(typeof repository.correctness.latencyValue).toBe('number');
      expect(typeof repository.busFactor.latencyValue).toBe('number');
      expect(typeof repository.responsiveMaintainer.latencyValue).toBe('number');
      expect(typeof repository.license.latencyValue).toBe('number');
    });
  });

  describe('jsonMetrics', () => {
    it('should return a correctly formatted JSON string', () => {
      // Manually set metric values for testing
      repository.url.value = 'https://github.com/user/repo';
      repository.netScore.value = 85;
      repository.rampUp.value = 0.75;
      repository.correctness.value = 0.9;
      repository.busFactor.value = 0.6;
      repository.responsiveMaintainer.value = 0.95;
      repository.license.value = 1;
    
      // Manually set latency values
      repository.netScore.latencyValue = 150;
      repository.rampUp.latencyValue = 100;
      repository.correctness.latencyValue = 120;
      repository.busFactor.latencyValue = 80;
      repository.responsiveMaintainer.latencyValue = 110;
      repository.license.latencyValue = 90;
    
      const expectedJson = JSON.stringify({
        URL: 'https://github.com/user/repo',
        NetScore: 85,
        RampUp: 0.75,
        Correctness: 0.9,
        BusFactor: 0.6,
        ResponsiveMaintainer: 0.95,
        License: 1,
        netscore_latency: 150,
        rampup_latency: 100,
        correctness_latency: 120,
        busfactor_latency: 80,
        responsiveMaintainer_latency: 110,
        license_latency: 90,
      });
    
      const jsonMetrics = repository.jsonMetrics();
    
      // Compare parsed objects to ignore formatting differences
      expect(JSON.parse(jsonMetrics)).toStrictEqual(JSON.parse(expectedJson));
    });    
  });
});
