#!/usr/bin/env node
import { program } from "commander";
import { startService } from "../src/scheduler.js";
import { daemonize } from "../src/daemon.js";
import { loadConfig } from "../src/config-loader.js";
import { logger } from "../src/logger.js";
import { cleanupProcesses } from "../src/process-manager.js"; // Added missing import

program
  .name("hlc")
  .description("Home Lab Controller - Schedule and manage recurring tasks")
  .version("1.0.0");

program
  .command("start")
  .description("Start the service")
  .option(
    "-c, --config <path>",
    "Path to config file",
    "./configs/hlc.config.yml"
  )
  .option("-d, --daemon", "Run as daemon")
  .option("-i, --interval <seconds>", "Fixed interval in seconds")
  .option("-cmd, --command <command>", "Single command to run")
  .action(async (options) => {
    // Setup cleanup handlers
    const handleExit = () => {
      cleanupProcesses();
      process.exit();
    };

    process.on("SIGINT", handleExit);
    process.on("SIGTERM", handleExit);

    if (options.daemon) {
      await daemonize();
    }

    // Actual service start logic was missing
    if (options.command) {
      if (!options.interval) {
        logger.error("Interval is required when using command mode");
        process.exit(1);
      }
      await startService([
        {
          command: options.command,
          interval: parseInt(options.interval),
        },
      ]);
    } else {
      const config = await loadConfig(options.config);
      await startService(config.jobs);
    }
  });

program
  .command("stop")
  .description("Stop the daemon")
  .action(() => {
    // Implement stop logic
    logger.info("Stop command received");
    cleanupProcesses();
  });

program.parse();
