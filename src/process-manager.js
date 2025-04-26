const activeProcesses = new Map();

export function addProcess(id, process) {
  activeProcesses.set(id, process);
}

export function removeProcess(id) {
  if (activeProcesses.has(id)) {
    activeProcesses.delete(id);
  }
}

export function cleanupProcesses() {
  for (const [id, process] of activeProcesses) {
    process.kill("SIGTERM");
    activeProcesses.delete(id);
  }
}
