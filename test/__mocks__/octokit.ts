import { Octokit } from "@octokit/rest";
import { jest } from "@jest/globals";
import { RequestParameters } from "@octokit/types";

// Define type for paginate with iterator
interface MockedPaginateInterface {
  <T = any, R = unknown>(endpoint: string, parameters?: any): Promise<T[]>;
  iterator<T = any, R = unknown>(endpoint: string, parameters?: any): AsyncIterableIterator<T>;
}

export const createMockOctokit = (): jest.Mocked<Octokit> => {
  const octokit = new Octokit() as jest.Mocked<Octokit>;

  // Mock the 'repos' namespace methods
  octokit.repos = {
    get: jest.fn(),
    getReadme: jest.fn(),
    listCommits: jest.fn(),
    // Add other repos methods as needed
  } as any;

  // Mock the 'paginate' method with required properties
  const paginateMock = jest.fn().mockResolvedValue([]);
  const paginateIteratorMock = jest.fn();
  (paginateMock as unknown as MockedPaginateInterface).iterator = paginateIteratorMock;
  octokit.paginate = paginateMock as unknown as typeof octokit.paginate;

  // Mock the 'request' method
  octokit.request = jest.fn().mockResolvedValue({});

  // Mock the 'rateLimit' namespace method with required properties
  octokit.rateLimit = {
    get: jest.fn(),
  } as any;

  return octokit;
};
