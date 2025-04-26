import { fork } from "child_process";
import fs from "fs-extra";
import path from "path";
import { logger } from "./logger.js";

const PID_DIR = path.join(process.env.HOME, ".hlc/pids");
const LOG_DIR = path.join(process.env.HOME, ".hlc/logs");

export async function daemonize() {
  await fs.ensureDir(PID_DIR);
  await fs.ensureDir(LOG_DIR);

  const child = fork(process.argv[1], process.argv.slice(2), {
    detached: true,
    stdio: "ignore",
  });

  child.unref();

  // Write PID file
  await fs.writeFile(path.join(PID_DIR, "daemon.pid"), child.pid.toString());

  logger.info(`Daemon started with PID: ${child.pid}`);
  process.exit(0);
}
