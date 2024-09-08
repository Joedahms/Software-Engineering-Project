import * as filesystem from 'node:fs'; // Access to log file
export class Logger {
    constructor(fileName = "../log.txt", level = 0) {
        this.fileName = fileName;
        this.level = level;
    }
    // Add text to log file
    add(level, message) {
        console.log(level);
        console.log(message);
        console.log(this.fileName);
        const currentLogLevelString = process.env.LOG_LEVEL;
        const currentLogLevel = Number(currentLogLevelString);
        if (currentLogLevel === level) {
            try {
                filesystem.writeFileSync(this.fileName, message);
            }
            catch (err) {
                console.error(err);
            }
        }
    }
    // Clear the log file
    clear() {
    }
}
;
