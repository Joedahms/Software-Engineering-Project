import { describe, it, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import { writeOutput } from '../src/output';
import * as readline from 'node:readline';

jest.mock('node:readline');

describe('writeOutput', () => {
  let mockReadlineInterface: jest.Mocked<readline.Interface>;

  beforeEach(() => {
    mockReadlineInterface = {
      write: jest.fn(),
      close: jest.fn(),
      question: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      setPrompt: jest.fn(),
      prompt: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
      off: jest.fn(),
      removeAllListeners: jest.fn(),
      listeners: jest.fn(),
      rawListeners: jest.fn(),
      emit: jest.fn(),
      addListener: jest.fn(),
      prependListener: jest.fn(),
      prependOnceListener: jest.fn(),
      eventNames: jest.fn(),
      getMaxListeners: jest.fn(),
      setMaxListeners: jest.fn(),
    } as unknown as jest.Mocked<readline.Interface>;

    (readline.createInterface as jest.Mock).mockReturnValue(mockReadlineInterface);
  });

  it('should write input to stdout', () => {
    const input = 'Hello, World!';
    writeOutput(input);
    expect(mockReadlineInterface.write).toHaveBeenCalledWith(input + '\n');
  });
});
