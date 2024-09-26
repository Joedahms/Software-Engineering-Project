import { describe, it, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import { Url, NetScore, RampUp, Correctness, BusFactor, ResponsiveMaintainer, License } from '../src/metric';
import { Logger } from '../src/logger';

describe('Metrics Classes', () => {
  const repoOwner = "testOwner";
  const repoName = "testRepo";

  it('should create a Url metric and calculate its value', () => {
    const urlMetric = new Url(repoOwner, repoName);
    expect(urlMetric.name).toBe("URL");
    expect(urlMetric.calculateValue()).toBe("URL");
  });

  it('should calculate NetScore correctly', async () => {
    const netScoreMetric = new NetScore(repoOwner, repoName);

    // Create instances of the dependencies
    const rampUp = new RampUp(repoOwner, repoName);
    const busFactor = new BusFactor(repoOwner, repoName);
    const responsiveMaintainer = new ResponsiveMaintainer(repoOwner, repoName);
    const license = new License(repoOwner, repoName);

    // Set values for the dependencies
    await rampUp.calculateValue(1000); // Example readme length
    await busFactor.calculateValue();    // Placeholder implementation
    await responsiveMaintainer.calculateValue(60, 12); // Example inputs
    await license.calculateValue("MIT", "MIT", "This project is licensed under the MIT License."); // Example inputs

    // Now calculate NetScore
    await netScoreMetric.calculateValue(rampUp, busFactor, responsiveMaintainer, license);
    
    expect(netScoreMetric.value).toBeGreaterThan(0);
  });

  it('should calculate RampUp based on readme length', async () => {
    const rampUpMetric = new RampUp(repoOwner, repoName);
    await rampUpMetric.calculateValue(1000); // Example readme length
    expect(rampUpMetric.value).toBeGreaterThan(0);
  });

  it('should calculate Correctness metric', async () => {
    const correctnessMetric = new Correctness(repoOwner, repoName);
    await correctnessMetric.calculateValue();
    // Add assertions based on your expected logic
    expect(correctnessMetric.value).toBe(0); // Adjust based on expected outcome
  });

  it('should calculate BusFactor metric', async () => {
    const busFactorMetric = new BusFactor(repoOwner, repoName);
    await busFactorMetric.calculateValue();
    // Add assertions based on your expected logic
    expect(busFactorMetric.value).toBe(0); // Adjust based on expected outcome
  });

  it('should calculate ResponsiveMaintainer metric', async () => {
    const responsiveMaintainerMetric = new ResponsiveMaintainer(repoOwner, repoName);
    await responsiveMaintainerMetric.calculateValue(60, 12); // Example inputs
    expect(responsiveMaintainerMetric.value).toBeGreaterThan(0);
  });

  it('should calculate License metric', async () => {
    const licenseMetric = new License(repoOwner, repoName);
    await licenseMetric.calculateValue("MIT", "MIT", "This project is licensed under the MIT License.");
    expect(licenseMetric.value).toBe(1); // Adjust based on expected outcome

    await licenseMetric.calculateValue("GPL", "Other", "This project is licensed under the MIT License.");
    expect(licenseMetric.value).toBe(0);
  });
});
