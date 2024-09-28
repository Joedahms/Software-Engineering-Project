// __mocks__/api_access.js
export class RepoStats {
    constructor(owner, name) {
      this.owner = owner;
      this.name = name;
      this.readmeLength = 1000;
      this.totalOpenIssues = 5;
      this.totalIssues = 10;
      this.totalCommits = 50;
      this.daysActive = 200;
      this.licenseName = "MIT License";
      this.readme = "This is a README file with MIT License.";
    }
  
    async getRepoCreatedUpdated() {
      // Mock implementation: do nothing or set mock data
    }
  
    async getRepoStats() {
      // Mock implementation: do nothing or set mock data
    }
  }
  