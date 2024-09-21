import { afterEach, beforeEach, describe, expect, it, jest, test } from "@jest/globals";
import { Logger } from '../src/logger';
import * as fs from 'node:fs';

describe('Logger', () => {
  const logFileName = 'test-log.txt';
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger(logFileName, 0);
    process.env.LOG_LEVEL = '0';
    logger.clear();
  });

  afterEach(() => {
    logger.clear();
  });

  it('should create a log file with the correct name', () => {
    expect(logger.fileName).toBe(logFileName);
  });

  it('should write a message to the log file when the log level matches', () => {
    const message = 'Test log message';
    logger.add(0, message);
    const logContent = fs.readFileSync(logFileName, 'utf-8');
    expect(logContent).toContain(message);
  });

  it('should not write a message to the log file when the log level does not match', () => {
    const message = 'Test log message';
    logger.add(1, message);
    const logContent = fs.readFileSync(logFileName, 'utf-8');
    expect(logContent).not.toContain(message);
  });

  it('should clear the log file', () => {
    logger.add(0, 'Test log message');
    logger.clear();
    const logContent = fs.readFileSync(logFileName, 'utf-8');
    expect(logContent).toBe('');
  });
});