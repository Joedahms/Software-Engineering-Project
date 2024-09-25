import * as filesystem from 'node:fs'; // Access to log file
export class Logger {
    // Defaults to ../log.txt as the log file and log level 0
    constructor(fileName = "log.txt", level = 0) {
        this.fileName = fileName;
        this.level = level;
    }
    // Add text to log file
    add(level, message) {
        const currentLogLevelString = process.env.LOG_LEVEL;
        const currentLogLevel = Number(currentLogLevelString); // So can compare with passed level
        if (currentLogLevel === level) {
            try {
                filesystem.writeFileSync(this.fileName, message + '\n', { flag: "a+" });
            }
            catch (err) {
                console.error(err);
            }
        }
    }
    // Clear the log file
    clear() {
        try {
            filesystem.writeFileSync(this.fileName, '');
        }
        catch (err) {
            console.error(err);
        }
    }
}
;
