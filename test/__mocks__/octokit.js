import { Octokit } from "@octokit/rest";
import { jest } from "@jest/globals";
export const createMockOctokit = () => {
    const octokit = new Octokit();
    // Mock the 'repos' namespace methods
    octokit.repos = {
        get: jest.fn(),
        getReadme: jest.fn(),
        listCommits: jest.fn(),
        // Add other repos methods as needed
    };
    // Mock the 'paginate' method with required properties
    const paginateMock = jest.fn().mockResolvedValue([]);
    const paginateIteratorMock = jest.fn();
    paginateMock.iterator = paginateIteratorMock;
    octokit.paginate = paginateMock;
    // Mock the 'request' method
    octokit.request = jest.fn().mockResolvedValue({});
    // Mock the 'rateLimit' namespace method with required properties
    octokit.rateLimit = {
        get: jest.fn(),
    };
    return octokit;
};
//# sourceMappingURL=octokit.js.map