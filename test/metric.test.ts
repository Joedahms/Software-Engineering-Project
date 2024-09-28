// @ts-nocheck
import { Logger } from "../src/logger.js";
import { Url, NetScore, RampUp, Correctness, BusFactor, ResponsiveMaintainer, License } from "../src/metric.js";

// Mock Logger
jest.mock("../src/logger.js");

describe("Metric Classes", () => {
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockLogger = new Logger() as jest.Mocked<Logger>;
    (Logger as jest.Mock).mockImplementation(() => mockLogger);
  });

  // Test for the abstract Metric class's minMax method
  describe("Metric - minMax", () => {
    // Since Metric is abstract, we'll test using a concrete subclass
    class TestMetric extends (require('../src/metric.js').Metric) {
      constructor(repoOwner: string, repoName: string) {
        super(repoOwner, repoName);
      }
    }

    test("minMax should normalize values correctly within range", () => {
      const testMetric = new TestMetric("owner", "repo");
      
      // Mock logger
      testMetric.logger = mockLogger;

      const inputValue = 5;
      const min = 0;
      const max = 10;
      const normalized = testMetric.minMax(inputValue, max, min);

      expect(normalized).toBe(0.5);
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Running min max normalization on 5 max/min = 10/0");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "min max result: 0.5");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "min max normalization successful, returning normalized value");
    });

    test("minMax should return 0 when normalized value is below 0", () => {
      const testMetric = new TestMetric("owner", "repo");
      testMetric.logger = mockLogger;

      const inputValue = -5;
      const min = 0;
      const max = 10;
      const normalized = testMetric.minMax(inputValue, max, min);

      expect(normalized).toBe(0);
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Running min max normalization on -5 max/min = 10/0");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "min max result: -0.5");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Normalized value less than 0, returning 0");
    });

    test("minMax should return 2 when normalized value is above 1", () => {
      const testMetric = new TestMetric("owner", "repo");
      testMetric.logger = mockLogger;

      const inputValue = 15;
      const min = 0;
      const max = 10;
      const normalized = testMetric.minMax(inputValue, max, min);

      expect(normalized).toBe(2);
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Running min max normalization on 15 max/min = 10/0");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "min max result: 1.5");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Normalized value greater than 1, returning 2");
    });

    test("minMax should handle edge cases correctly", () => {
      const testMetric = new TestMetric("owner", "repo");
      testMetric.logger = mockLogger;

      // Exactly min
      expect(testMetric.minMax(0, 10, 0)).toBe(0);
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Running min max normalization on 0 max/min = 10/0");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "min max result: 0");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Normalized value less than 0, returning 0");

      // Exactly max
      expect(testMetric.minMax(10, 10, 0)).toBe(1);
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Running min max normalization on 10 max/min = 10/0");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "min max result: 1");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "min max normalization successful, returning normalized value");
    });
  });

  // Tests for Url class
  describe("Url Metric", () => {
    test("Url should initialize correctly", () => {
      const urlMetric = new Url("owner", "repo");

      expect(urlMetric.repoOwner).toBe("owner");
      expect(urlMetric.repoName).toBe("repo");
      expect(urlMetric.name).toBe("URL");
      expect(urlMetric.value).toBe("testtest");
      expect(urlMetric.latencyValue).toBe(0);
    });

    test("Url.calculateValue should return the name", () => {
      const urlMetric = new Url("owner", "repo");
      const result = urlMetric.calculateValue();
      expect(result).toBe("URL");
    });
  });

  // Tests for NetScore class
  describe("NetScore Metric", () => {
    let netScoreMetric: NetScore;

    beforeEach(() => {
      netScoreMetric = new NetScore("owner", "repo");
    });

    test("NetScore should initialize correctly", () => {
      expect(netScoreMetric.repoOwner).toBe("owner");
      expect(netScoreMetric.repoName).toBe("repo");
      expect(netScoreMetric.name).toBe("NetScore");
      expect(netScoreMetric.value).toBe(0);
      expect(netScoreMetric.latencyValue).toBe(0);
    });

    test("NetScore.calculateValue should compute correctly", async () => {
      // Mock dependencies
      const mockRampUp = { value: 1 } as any;
      const mockCorrectness = { value: 1 } as any;
      const mockBusFactor = { value: 1 } as any;
      const mockResponsiveMaintainer = { value: 1 } as any;
      const mockLicense = { value: 1 } as any;

      // Mock minMax
      jest.spyOn(netScoreMetric, 'minMax').mockReturnValueOnce(1);

      await netScoreMetric.calculateValue(
        mockRampUp,
        mockCorrectness,
        mockBusFactor,
        mockResponsiveMaintainer,
        mockLicense
      );

      expect(netScoreMetric.value).toBe(1 * 1); // license.value * normalizedWeightedSum
      expect(netScoreMetric.latencyValue).toBeGreaterThanOrEqual(0);
      expect(mockLogger.add).toHaveBeenCalledWith(1, "Calculating NetScore for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Calculating NetScore for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(1, "repo NetScore calculated successfully");
    });

    test("NetScore.calculateValue should handle normalizedWeightedSum === 2", async () => {
      const mockRampUp = { value: 2 } as any;
      const mockCorrectness = { value: 2 } as any;
      const mockBusFactor = { value: 2 } as any;
      const mockResponsiveMaintainer = { value: 2 } as any;
      const mockLicense = { value: 1 } as any;

      // Mock minMax to return 2
      jest.spyOn(netScoreMetric, 'minMax').mockReturnValueOnce(2);

      // Mock process.exit
      const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit: 1');
      });

      await expect(netScoreMetric.calculateValue(
        mockRampUp,
        mockCorrectness,
        mockBusFactor,
        mockResponsiveMaintainer,
        mockLicense
      )).rejects.toThrow("process.exit: 1");

      expect(mockLogger.add).toHaveBeenCalledWith(1, "Calculating NetScore for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Calculating NetScore for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(1, "repo NetScore calculated successfully");
      expect(exitMock).toHaveBeenCalledWith(1);

      exitMock.mockRestore();
    });
  });

  // Similarly, write tests for RampUp, Correctness, BusFactor, ResponsiveMaintainer, License
});
