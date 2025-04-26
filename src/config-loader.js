import fs from "fs-extra";
import yaml from "js-yaml";
import { logger } from "./logger.js";

export async function loadConfig(configPath) {
  try {
    const fileContents = await fs.readFile(configPath, "utf8");
    return yaml.load(fileContents);
  } catch (error) {
    logger.error(`Error loading config: ${error.message}`);
    process.exit(1);
  }
}
