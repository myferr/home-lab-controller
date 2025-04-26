import { execa } from "execa";
import { logger } from "./logger.js";
import { addProcess, removeProcess } from "./process-manager.js";

export async function startService(jobs) {
  const runLoop = async (job) => {
    let shouldContinue = true;

    // Handle termination signals
    const cleanup = () => {
      shouldContinue = false;
      removeProcess(job.id);
      logger.info(`Stopped job: ${job.command}`);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    while (shouldContinue) {
      try {
        logger.info(`Starting job: ${job.command}`);
        const subprocess = execa(job.command, { shell: true });
        addProcess(job.id, subprocess);

        const { stdout, stderr } = await subprocess;
        logger.info(`Job completed: ${job.command}\n${stdout}`);
        if (stderr) logger.error(stderr);
      } catch (error) {
        logger.error(`Job failed: ${job.command}\n${error.message}`);
      } finally {
        removeProcess(job.id);
        if (shouldContinue) {
          await new Promise((resolve) =>
            setTimeout(resolve, job.interval * 1000)
          );
        }
      }
    }
  };

  // Start all jobs concurrently
  jobs.forEach((job) => {
    job.id = crypto.randomUUID();
    runLoop(job);
  });
}
