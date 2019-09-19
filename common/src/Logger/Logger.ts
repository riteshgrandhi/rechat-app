/**
 * Enumerator for Log Level
 */
export enum LogLevel {
  VERBOSE,
  WARNING,
  ERROR
}

export class Logger {
  private logLevel: LogLevel;

  /**
   * Logger Constructor
   */
  constructor(level: LogLevel) {
    this.logLevel = level;
  }

  public log(title: string, message: string, logLevel: LogLevel, data?: any) {
    let _title = `----------------${title}----------------`;
    if (logLevel < this.logLevel) {
      return;
    }
    console.log(_title);
    console.log(message);
    if (data) {
      console.log(data);
    }
    console.log("-".repeat(_title.length));
  }
}
