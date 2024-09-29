// NoOpLogger.ts
export class NoOpLogger {
    constructor(fileName = 'log.txt', level = 0) {
        this.fileName = fileName;
        this.level = level;
    }
    add(level, message) {
        // No operation
    }
    clear() {
        // No operation
    }
}
