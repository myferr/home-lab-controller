#!/usr/bin/env node

import { program } from "commander";
import { startService } from "../src/scheduler.js";
import { daemonize } from "../src/daemon.js";
import { loadConfig } from "../src/config-loader.js";
import { logger } from "../src/logger.js";
import { cleanupProcesses } from "../src/process-manager.js";
import axios from "axios";
import YAML from "yaml";
import { spawn } from "child_process";

let runningProcesses = [];

function stopAllProcesses() {
  runningProcesses.forEach((proc) => {
    if (!proc.killed) {
      proc.kill();
    }
  });
  runningProcesses = [];
  logger.info("🛑 Stopped all running instances.");
}

function startInstances(jobs) {
  jobs.forEach((job) => {
    logger.info(`🚀 Starting instance '${job.name}'...`);
    const instance = spawn("bash", ["-c", job.command], { stdio: "inherit" });

    runningProcesses.push(instance);
  });
}

// Function to fetch and parse remote YAML
async function fetchRemoteConfig(url) {
  try {
    const response = await axios.get(url);
    const config = YAML.parse(response.data);
    return config.jobs || [];
  } catch (error) {
    logger.error("❌ Failed to fetch remote configuration:", error.message);
    process.exit(1);
  }
}

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

program
  .command("gist")
  .description("Fetch and run jobs from a GitHub Gist")
  .requiredOption("--id <id>", "GitHub Gist ID")
  .action(async (options) => {
    let latestSha = null;
    let currentJobs = [];

    async function fetchAndUpdate() {
      try {
        const gistUrl = `https://api.github.com/gists/${options.id}`;
        const response = await axios.get(gistUrl);
        const gistData = response.data;

        // Get first file's raw URL
        const files = Object.values(gistData.files);
        if (files.length === 0) {
          logger.error("❌ No files found in Gist");
          return;
        }
        const rawUrl = files[0].raw_url;

        // Fetch YAML config
        const yamlResponse = await axios.get(rawUrl);
        const config = YAML.parse(yamlResponse.data);
        const jobs = config.jobs || [];
        const currentSha = gistData.history[0].version;

        if (latestSha === null) {
          // Initial setup
          latestSha = currentSha;
          currentJobs = jobs;
          logger.info("✅ Initial configuration loaded from Gist");
          startInstances(currentJobs);
        } else if (currentSha !== latestSha) {
          logger.info("🔄 Detected new commit - restarting instances...");
          latestSha = currentSha;
          currentJobs = jobs;
          stopAllProcesses();
          startInstances(currentJobs);
        } else {
          logger.info("🔍 No changes detected in Gist");
        }
      } catch (error) {
        if (error.code == "ENOTFOUND") {
          logger.error("❌ Gist ID is not valid. ENOTFOUND api.github.com");
          process.exit(0);
        } else {
          logger.error(`❌ Gist update failed: ${error.message}`);
        }      }
    }

    // Initial fetch
    await fetchAndUpdate();

    // Check for updates every 60 seconds
    const interval = setInterval(fetchAndUpdate, 60 * 1000);
    logger.info("🔎 Monitoring Gist for changes every 60 seconds");

    // Cleanup on exit
    const handleExit = () => {
      clearInterval(interval);
      cleanupProcesses();
      process.exit();
    };
    process.on("SIGINT", handleExit);
    process.on("SIGTERM", handleExit);
  });

program.parse();
