// NoOpLogger.ts
export class NoOpLogger {
    readonly fileName: string;
    readonly level: number;
  
    constructor(fileName: string = 'log.txt', level: number = 0) {
      this.fileName = fileName;
      this.level = level;
    }
  
    add(level: number, message: string): void {
      // No operation
    }
  
    clear(): void {
      // No operation
    }
  }
  