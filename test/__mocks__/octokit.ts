import { Octokit } from "@octokit/rest";
import { createMock } from "octomock";

export const createMockOctokit = () => {
  const octokit = createMock(Octokit);

  // Customize mock responses as needed
  octokit.repos.get.mockResolvedValue({
    data: {
      created_at: "2020-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    },
    status: 200,
    headers: {},
    url: "https://api.github.com/repos/test-owner/test-repo",
  });

  // Add more mock implementations as required

  return octokit;
};
