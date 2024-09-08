import * as filesystem from 'node:fs';  // Access to log file

export class Logger {
  readonly fileName: string;  // File where logs are written to
  readonly level: number;     // Log verbosity level
  
  // Defaults to ../log.txt as the log file and log level 0
  constructor(fileName = "log.txt", level = 0) {
    this.fileName = fileName;
    this.level = level;
  }

  // Add text to log file
  add(level: number, message: string): void {
    const currentLogLevelString: string = process.env.LOG_LEVEL!;
    const currentLogLevel: number = Number(currentLogLevelString);  // So can compare with passed level
    if (currentLogLevel === level) {
      try {
        filesystem.writeFileSync(this.fileName, message);
      } catch (err) {
        console.error(err);
      }
    }
  }
  // Clear the log file
  clear() {
    try {
      filesystem.writeFileSync(this.fileName, '');
    } catch (err) {
      console.error(err);
    }
  }
};

