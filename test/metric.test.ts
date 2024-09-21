import { describe, it, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import { Url, NetScore, RampUp, Correctness, BusFactor, ResponsiveMaintainer, License } from '../src/metric';
import { Logger } from '../src/logger';

jest.mock('../src/logger');

describe('Metric subclasses', () => {
  let loggerMock: jest.Mocked<Logger>;

  beforeEach(() => {
    loggerMock = new Logger() as jest.Mocked<Logger>;
  });

  test('Url metric should have correct initial values', () => {
    const urlMetric = new Url('owner', 'repo');
    expect(urlMetric.name).toBe('URL');
    expect(urlMetric.value).toBe('testtest');
  });

  test('NetScore metric should calculate value correctly', async () => {
    const netScore = new NetScore('owner', 'repo');
    const rampUp = { value: 1 };
    const busFactor = { value: 1 };
    const responsiveMaintainer = { value: 1 };
    const license = { value: 1 };

    await netScore.calculateValue(rampUp, busFactor, responsiveMaintainer, license);
    expect(netScore.value).toBe(1);
  });

  test('RampUp metric should calculate value correctly', async () => {
    const rampUp = new RampUp('owner', 'repo');
    await rampUp.calculateValue(1000);
    expect(rampUp.value).toBeGreaterThan(0);
  });

  test('Correctness metric should calculate value correctly', async () => {
    const correctness = new Correctness('owner', 'repo');
    await correctness.calculateValue();
    expect(correctness.value).toBe(0); // Assuming no calculation logic is provided
  });

  test('BusFactor metric should calculate value correctly', async () => {
    const busFactor = new BusFactor('owner', 'repo');
    await busFactor.calculateValue();
    expect(busFactor.value).toBe(0); // Assuming no calculation logic is provided
  });

  test('ResponsiveMaintainer metric should calculate value correctly', async () => {
    const responsiveMaintainer = new ResponsiveMaintainer('owner', 'repo');
    await responsiveMaintainer.calculateValue(90, 100);
    expect(responsiveMaintainer.value).toBeGreaterThan(0);
  });

  test('License metric should calculate value correctly', async () => {
    const license = new License('owner', 'repo');
    await license.calculateValue('MIT', 'MIT');
    expect(license.value).toBe(1);
  });
});
