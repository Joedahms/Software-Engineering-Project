Test Suite for ECE461 Project

Welcome to the Test Suite for ECE461 Project. This document provides comprehensive guidance on setting up, running, and maintaining the test suite for your project. The test suite is built using Jest, TypeScript, and ESM (ECMAScript Modules), ensuring robust and reliable testing of your application's functionalities.

Introduction
This test suite is designed to ensure the reliability and correctness of [Your Project Name]. By leveraging Jest and TypeScript, the suite provides a strong foundation for unit, integration, and end-to-end testing. The use of ESM allows for modern JavaScript module handling, aligning with current development standards.

Prerequisites
Before setting up and running the test suite, ensure you have the following installed on your system:

Node.js: Version 14 or higher
npm: Comes bundled with Node.js
TypeScript: Installed globally or as a dev dependency
Git: For version control and repository management

Configuration
TypeScript Configuration (tsconfig.json)
Ensure your tsconfig.json is properly configured to work with Jest and ESM:

json
Copy code
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src", "test"]
}

Running Tests
To execute the test suite, use the following command:
npm test

Available Scripts:
npm test: Runs all tests once.
npm run test:watch: Runs tests in watch mode, re-running tests on file changes.
npm run test:coverage: Generates a coverage report.

Mocking Dependencies
Mocking is essential for isolating the unit under test and controlling the behavior of external dependencies. Here's how to effectively mock dependencies in your tests:

1. Using jest.mock
typescript
Copy code
jest.mock('../src/logger.js', () => {
  return {
    Logger: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      clear: jest.fn(),
      fileName: 'mockFile.log',
      level: 1,
    })),
  };
});
Explanation:

jest.mock: Replaces the actual implementation of the module with a mock.
mockImplementation: Defines how the mocked class or function behaves when instantiated or called.

2. Mocking Classes with Methods
When mocking a class like Repository, ensure all its methods are mocked:

typescript
Copy code
jest.mock('../src/repository.js', () => {
  return {
    Repository: jest.fn().mockImplementation(() => ({
      calculateAllMetrics: jest.fn(),
      jsonMetrics: jest.fn(),
    })),
  };
});

3. Accessing Mocked Instances
After mocking, access the mocked instances to define return values or track calls:

typescript
Copy code
const { Repository } = await import('../src/repository.js');
const mockRepositoryInstance = new Repository() as jest.Mocked<Repository>;
mockRepositoryInstance.calculateAllMetrics.mockResolvedValueOnce(undefined);
mockRepositoryInstance.jsonMetrics.mockReturnValueOnce('{"repo": "test-repo", "metrics": {}}');
4. Mocking External Libraries
For libraries like @octokit/rest, mock them before importing the modules under test:

typescript
Copy code
await jest.unstable_mockModule('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      repos: {
        get: jest.fn(),
        getReadme: jest.fn(),
        listCommits: jest.fn(),
      },
      paginate: jest.fn(),
      request: jest.fn(),
      rateLimit: {
        get: jest.fn(),
      },
    })),
  };
});
Troubleshooting
Common Errors and Solutions
Cannot use import statement outside a module

Cause: Jest isn't correctly configured to handle ESM.
Solution: Ensure jest.config.js and tsconfig.json are set up for ESM as shown in the Configuration section.
Property 'mockImplementation' does not exist on type 'typeof Repository'.

Cause: TypeScript doesn't recognize the class as a Jest mock.
Solution: Properly mock the class using jest.unstable_mockModule and cast it as jest.MockedClass<typeof Repository>.
TypeScript Type Errors

Cause: Mismatched types between mocked methods and their actual implementations.
Solution: Ensure that mocked methods return values consistent with their TypeScript definitions. Use type assertions like as jest.Mocked<Repository>.
Mocks Not Being Recognized

Cause: Incorrect mocking order, especially with ESM.
Solution: Use jest.unstable_mockModule to mock dependencies before importing modules under test.
