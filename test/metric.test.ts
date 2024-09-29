import { Logger } from "../src/logger";
import { Url, NetScore, RampUp, Correctness, BusFactor, ResponsiveMaintainer, License, Metric } from "../src/metric";
import { jest } from '@jest/globals';

// Mock Logger
jest.mock("../src/logger");

describe("Metric Classes", () => {
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockLogger = new Logger() as jest.Mocked<Logger>;
    mockLogger.add = jest.fn();
    mockLogger.clear = jest.fn();
  });

  // Since Metric is abstract, create a concrete subclass for testing
  class TestMetric extends Metric {
    constructor(repoOwner: string, repoName: string) {
      super(repoOwner, repoName);
    }

    // Implement any abstract methods if present
    calculateValue(): void {
      // Dummy implementation
    }
  }

  describe("Metric - minMax", () => {
    test("minMax should normalize values correctly within range", () => {
      const testMetric = new TestMetric("owner", "repo");
      const inputValue = 5;
      const min = 0;
      const max = 10;
      const normalized = testMetric.minMax(inputValue, max, min);

      expect(normalized).toBe(0.5);
      expect(mockLogger.add).toHaveBeenCalledWith(0, "Running min max normalization on 5 max/min = 10/0");
      expect(mockLogger.add).toHaveBeenCalledWith(0, "min max result: 0.5");
      expect(mockLogger.add).toHaveBeenCalledWith(0, "min max normalization successful, returning normalized value");
    });

    test("minMax should return 0 when normalized value is below 0", () => {
      const testMetric = new TestMetric("owner", "repo");
      const inputValue = -5;
      const min = 0;
      const max = 10;
      const normalized = testMetric.minMax(inputValue, max, min);

      expect(normalized).toBe(0);
      expect(mockLogger.add).toHaveBeenCalledWith(0, "Running min max normalization on -5 max/min = 10/0");
      expect(mockLogger.add).toHaveBeenCalledWith(0, "min max result: -0.5");
      expect(mockLogger.add).toHaveBeenCalledWith(0, "Normalized value less than 0, returning 0");
    });

    test("minMax should return 2 when normalized value is above 1", () => {
      const testMetric = new TestMetric("owner", "repo");
      const inputValue = 15;
      const min = 0;
      const max = 10;
      const normalized = testMetric.minMax(inputValue, max, min);

      expect(normalized).toBe(2);
      expect(mockLogger.add).toHaveBeenCalledWith(0, "Running min max normalization on 15 max/min = 10/0");
      expect(mockLogger.add).toHaveBeenCalledWith(0, "min max result: 1.5");
      expect(mockLogger.add).toHaveBeenCalledWith(0, "Normalized value greater than 1, returning 2");
    });

    test("minMax should handle edge cases correctly", () => {
      const testMetric = new TestMetric("owner", "repo");

      // Exactly min
      const normalizedMin = testMetric.minMax(0, 10, 0);
      expect(normalizedMin).toBe(0);
      expect(mockLogger.add).toHaveBeenCalledWith(0, "Running min max normalization on 0 max/min = 10/0");
      expect(mockLogger.add).toHaveBeenCalledWith(0, "min max result: 0");
      expect(mockLogger.add).toHaveBeenCalledWith(0, "Normalized value less than 0, returning 0");

      // Exactly max
      const normalizedMax = testMetric.minMax(10, 10, 0);
      expect(normalizedMax).toBe(1);
      expect(mockLogger.add).toHaveBeenCalledWith(0, "Running min max normalization on 10 max/min = 10/0");
      expect(mockLogger.add).toHaveBeenCalledWith(0, "min max result: 1");
      expect(mockLogger.add).toHaveBeenCalledWith(0, "min max normalization successful, returning normalized value");
    });
  });

  // Tests for Url class
  describe("Url Metric", () => {
    test("Url should initialize correctly", () => {
      const urlMetric = new Url("owner", "repo");

      expect(urlMetric.repoOwner).toBe("owner");
      expect(urlMetric.repoName).toBe("repo");
      expect(urlMetric.name).toBe("URL");
      expect(urlMetric.value).toBe("testtest"); // Assuming 'testtest' is set in Url class
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
      const exitMock = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error('process.exit: 1');
      });

      // Spy on console.error
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

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
      expect(consoleErrorMock).toHaveBeenCalledWith("Maximum too low for NetScore metric");

      // Restore mocks
      exitMock.mockRestore();
      consoleErrorMock.mockRestore();
    });
  });

  // Tests for RampUp class
  describe("RampUp Metric", () => {
    let rampUpMetric: RampUp;

    beforeEach(() => {
      rampUpMetric = new RampUp("owner", "repo");
    });

    test("RampUp should initialize correctly", () => {
      expect(rampUpMetric.repoOwner).toBe("owner");
      expect(rampUpMetric.repoName).toBe("repo");
      expect(rampUpMetric.name).toBe("RampUp");
      expect(rampUpMetric.value).toBe(0);
      expect(rampUpMetric.latencyValue).toBe(0);
    });

    test("RampUp.calculateValue should compute correctly", async () => {
      // Mock dependencies
      const mockCommits = 50;
      const mockMonths = 10;

      // Mock minMax
      jest.spyOn(rampUpMetric, 'minMax').mockReturnValueOnce(1);

      await rampUpMetric.calculateValue(mockCommits);

      expect(rampUpMetric.value).toBe(1); // Assuming normalized value is 1
      expect(rampUpMetric.latencyValue).toBeGreaterThanOrEqual(0);
      expect(mockLogger.add).toHaveBeenCalledWith(1, "Calculating RampUp for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Calculating RampUp for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(1, "repo RampUp calculated successfully");
    });

    test("RampUp.calculateValue should handle normalizedValue === 2", async () => {
      const mockCommits = 200;
      const mockMonths = 5;

      // Mock minMax to return 2
      jest.spyOn(rampUpMetric, 'minMax').mockReturnValueOnce(2);

      // Mock process.exit
      const exitMock = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error('process.exit: 1');
      });

      // Spy on console.error
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(rampUpMetric.calculateValue(mockCommits)).rejects.toThrow("process.exit: 1");

      expect(mockLogger.add).toHaveBeenCalledWith(1, "Calculating RampUp for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Calculating RampUp for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(1, "repo RampUp calculated successfully");
      expect(exitMock).toHaveBeenCalledWith(1);
      expect(consoleErrorMock).toHaveBeenCalledWith("Maximum too low for RampUp metric");

      // Restore mocks
      exitMock.mockRestore();
      consoleErrorMock.mockRestore();
    });
  });

  // Tests for Correctness class
  describe("Correctness Metric", () => {
    let correctnessMetric: Correctness;

    beforeEach(() => {
      correctnessMetric = new Correctness("owner", "repo");
    });

    test("Correctness should initialize correctly", () => {
      expect(correctnessMetric.repoOwner).toBe("owner");
      expect(correctnessMetric.repoName).toBe("repo");
      expect(correctnessMetric.name).toBe("Correctness");
      expect(correctnessMetric.value).toBe(0);
      expect(correctnessMetric.latencyValue).toBe(0);
    });

    test("Correctness.calculateValue should compute correctly", async () => {
      // Mock dependencies
      const mockIssues = 10;
      const mockBugs = 2;

      // Mock minMax
      jest.spyOn(correctnessMetric, 'minMax').mockReturnValueOnce(0.8);

      await correctnessMetric.calculateValue(mockIssues, mockBugs);

      expect(correctnessMetric.value).toBe(0.8); // Assuming normalized value is 0.8
      expect(correctnessMetric.latencyValue).toBeGreaterThanOrEqual(0);
      expect(mockLogger.add).toHaveBeenCalledWith(1, "Calculating Correctness for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Calculating Correctness for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(1, "repo Correctness calculated successfully");
    });

    test("Correctness.calculateValue should handle normalizedValue === 2", async () => {
      const mockIssues = 100;
      const mockBugs = 50;

      // Mock minMax to return 2
      jest.spyOn(correctnessMetric, 'minMax').mockReturnValueOnce(2);

      // Mock process.exit
      const exitMock = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error('process.exit: 1');
      });

      // Spy on console.error
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(correctnessMetric.calculateValue(mockIssues, mockBugs)).rejects.toThrow("process.exit: 1");

      expect(mockLogger.add).toHaveBeenCalledWith(1, "Calculating Correctness for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Calculating Correctness for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(1, "repo Correctness calculated successfully");
      expect(exitMock).toHaveBeenCalledWith(1);
      expect(consoleErrorMock).toHaveBeenCalledWith("Maximum too low for Correctness metric");

      // Restore mocks
      exitMock.mockRestore();
      consoleErrorMock.mockRestore();
    });
  });

  // Tests for BusFactor class
  describe("BusFactor Metric", () => {
    let busFactorMetric: BusFactor;

    beforeEach(() => {
      busFactorMetric = new BusFactor("owner", "repo");
    });

    test("BusFactor should initialize correctly", () => {
      expect(busFactorMetric.repoOwner).toBe("owner");
      expect(busFactorMetric.repoName).toBe("repo");
      expect(busFactorMetric.name).toBe("BusFactor");
      expect(busFactorMetric.value).toBe(0);
      expect(busFactorMetric.latencyValue).toBe(0);
    });

    test("BusFactor.calculateValue should compute correctly", async () => {
      // Mock dependencies
      const mockContributors = 5;
      const mockTopContributors = 2;

      // Mock minMax
      jest.spyOn(busFactorMetric, 'minMax').mockReturnValueOnce(0.6);

      await busFactorMetric.calculateValue();

      expect(busFactorMetric.value).toBe(0.6); // Assuming normalized value is 0.6
      expect(busFactorMetric.latencyValue).toBeGreaterThanOrEqual(0);
      expect(mockLogger.add).toHaveBeenCalledWith(1, "Calculating BusFactor for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Calculating BusFactor for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(1, "repo BusFactor calculated successfully");
    });

    test("BusFactor.calculateValue should handle normalizedValue === 2", async () => {
      const mockContributors = 1;
      const mockTopContributors = 1;

      // Mock minMax to return 2
      jest.spyOn(busFactorMetric, 'minMax').mockReturnValueOnce(2);

      // Mock process.exit
      const exitMock = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error('process.exit: 1');
      });

      // Spy on console.error
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(busFactorMetric.calculateValue()).rejects.toThrow("process.exit: 1");

      expect(mockLogger.add).toHaveBeenCalledWith(1, "Calculating BusFactor for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Calculating BusFactor for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(1, "repo BusFactor calculated successfully");
      expect(exitMock).toHaveBeenCalledWith(1);
      expect(consoleErrorMock).toHaveBeenCalledWith("Maximum too low for BusFactor metric");

      // Restore mocks
      exitMock.mockRestore();
      consoleErrorMock.mockRestore();
    });
  });

  // Tests for ResponsiveMaintainer class
  describe("ResponsiveMaintainer Metric", () => {
    let responsiveMaintainerMetric: ResponsiveMaintainer;

    beforeEach(() => {
      responsiveMaintainerMetric = new ResponsiveMaintainer("owner", "repo");
    });

    test("ResponsiveMaintainer should initialize correctly", () => {
      expect(responsiveMaintainerMetric.repoOwner).toBe("owner");
      expect(responsiveMaintainerMetric.repoName).toBe("repo");
      expect(responsiveMaintainerMetric.name).toBe("ResponsiveMaintainer");
      expect(responsiveMaintainerMetric.value).toBe(0);
      expect(responsiveMaintainerMetric.latencyValue).toBe(0);
    });

    test("ResponsiveMaintainer.calculateValue should compute correctly", async () => {
      // Mock dependencies
      const mockResponses = 20;
      const mockIssueResponses = 5;

      // Mock minMax
      jest.spyOn(responsiveMaintainerMetric, 'minMax').mockReturnValueOnce(0.75);

      await responsiveMaintainerMetric.calculateValue(mockResponses, mockIssueResponses);

      expect(responsiveMaintainerMetric.value).toBe(0.75); // Assuming normalized value is 0.75
      expect(responsiveMaintainerMetric.latencyValue).toBeGreaterThanOrEqual(0);
      expect(mockLogger.add).toHaveBeenCalledWith(1, "Calculating ResponsiveMaintainer for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Calculating ResponsiveMaintainer for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(1, "repo ResponsiveMaintainer calculated successfully");
    });

    test("ResponsiveMaintainer.calculateValue should handle normalizedValue === 2", async () => {
      const mockResponses = 1;
      const mockIssueResponses = 1;

      // Mock minMax to return 2
      jest.spyOn(responsiveMaintainerMetric, 'minMax').mockReturnValueOnce(2);

      // Mock process.exit
      const exitMock = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error('process.exit: 1');
      });

      // Spy on console.error
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(responsiveMaintainerMetric.calculateValue(mockResponses, mockIssueResponses)).rejects.toThrow("process.exit: 1");

      expect(mockLogger.add).toHaveBeenCalledWith(1, "Calculating ResponsiveMaintainer for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Calculating ResponsiveMaintainer for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(1, "repo ResponsiveMaintainer calculated successfully");
      expect(exitMock).toHaveBeenCalledWith(1);
      expect(consoleErrorMock).toHaveBeenCalledWith("Maximum too low for ResponsiveMaintainer metric");

      // Restore mocks
      exitMock.mockRestore();
      consoleErrorMock.mockRestore();
    });
  });

  // Tests for License class
  describe("License Metric", () => {
    let licenseMetric: License;

    beforeEach(() => {
      licenseMetric = new License("owner", "repo");
    });

    test("License should initialize correctly", () => {
      expect(licenseMetric.repoOwner).toBe("owner");
      expect(licenseMetric.repoName).toBe("repo");
      expect(licenseMetric.name).toBe("License");
      expect(licenseMetric.value).toBe("No License"); // Assuming default value is "No License"
      expect(licenseMetric.latencyValue).toBe(0);
    });

    test("License.calculateValue should set license name correctly", async () => {
      // Mock dependencies
      const mockLicenseName = "MIT License";

      // Mock minMax (if applicable)
      // If License.calculateValue uses minMax, mock it accordingly
      // Assuming License.calculateValue does not use minMax and just sets the license name
      jest.spyOn(licenseMetric, 'minMax').mockReturnValueOnce(1); // If needed

      await licenseMetric.calculateValue(mockLicenseName, "default", "default");

      expect(licenseMetric.value).toBe(mockLicenseName);
      expect(licenseMetric.latencyValue).toBeGreaterThanOrEqual(0);
      expect(mockLogger.add).toHaveBeenCalledWith(1, "Calculating License for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Calculating License for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(1, "repo License calculated successfully");
    });

    test("License.calculateValue should handle empty license name", async () => {
      const mockLicenseName = "";

      // Mock minMax if used
      jest.spyOn(licenseMetric, 'minMax').mockReturnValueOnce(0); // If applicable

      await licenseMetric.calculateValue(mockLicenseName, "default", "default");

      expect(licenseMetric.value).toBe("No License"); // Assuming it defaults to "No License" if empty
      expect(mockLogger.add).toHaveBeenCalledWith(1, "Calculating License for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(2, "Calculating License for repo");
      expect(mockLogger.add).toHaveBeenCalledWith(1, "repo License calculated successfully");
    });
  });
});
