import { Octokit } from '@octokit/rest';
import { afterEach, beforeEach, describe, expect, it, jest, test } from "@jest/globals";
import { mockDeep } from 'jest-mock-extended';
import { fetchAllPages, RepoStats } from '../src/api_access';

const octokit = mockDeep<Octokit>();

describe('fetchAllPages', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('fetches all pages successfully', async () => {
        const mockData = [1, 2, 3, 4, 5];
        octokit.paginate.mockResolvedValue(mockData);

        const result = await fetchAllPages<number>('GET /some/endpoint', { param1: 'value1' });

        expect(result).toEqual(mockData);
        expect(octokit.paginate).toHaveBeenCalledWith('GET /some/endpoint', { param1: 'value1' });
    });

    test('handles empty response', async () => {
        octokit.paginate.mockResolvedValue([]);

        const result = await fetchAllPages<number>('GET /some/endpoint', { param1: 'value1' });

        expect(result).toEqual([]);
        expect(octokit.paginate).toHaveBeenCalledWith('GET /some/endpoint', { param1: 'value1' });
    });

    test('handles errors', async () => {
        const errorMessage = 'Network error';
        octokit.paginate.mockRejectedValue(new Error(errorMessage));

        await expect(fetchAllPages<number>('GET /some/endpoint', { param1: 'value1' })).rejects.toThrow(errorMessage);
        expect(octokit.paginate).toHaveBeenCalledWith('GET /some/endpoint', { param1: 'value1' });
    });
});