import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { format } from "date-fns";

const LOG_DIR = path.join(process.env.HOME, ".hlc/logs");

class Logger {
  constructor() {
    this.logStream = null;
  }

  async initialize() {
    await fs.ensureDir(LOG_DIR);
    const logPath = path.join(
      LOG_DIR,
      `${format(new Date(), "yyyy-MM-dd")}.log`
    );
    this.logStream = fs.createWriteStream(logPath, { flags: "a" });
  }

  log(message, level = "info") {
    const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    this.logStream.write(logMessage);

    // Colored console output
    const color =
      {
        info: chalk.blue,
        error: chalk.red,
        warn: chalk.yellow,
      }[level] || chalk.white;

    console.log(color(logMessage));
  }

  info(message) {
    this.log(message, "info");
  }
  error(message) {
    this.log(message, "error");
  }
  warn(message) {
    this.log(message, "warn");
  }
}

export const logger = new Logger();
await logger.initialize();
