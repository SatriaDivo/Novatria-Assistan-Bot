const os = require("os");
const { exec } = require("child_process");
const config = require("../config");

function formatBytesToMb(bytes) {
  return Math.round(bytes / (1024 * 1024));
}

function truncateOutput(text, maxLength = 1800) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "\n... (output dipotong)";
}

function executeCommand(cmd, timeoutMs = 10000) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: timeoutMs, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        stdout: truncateOutput(stdout || ""),
        stderr: truncateOutput(stderr || ""),
        exitCode: error ? (error.code ?? 1) : 0,
        killed: Boolean(error?.killed),
      });
    });
  });
}

async function checkServiceActive(serviceName) {
  // Hanya bisa mengecek systemctl di OS berbasis Linux/Unix
  if (process.platform === "win32") {
    return true;
  }

  const result = await executeCommand(`systemctl is-active ${serviceName}`);
  return result.stdout.trim() === "active";
}

async function getSystemStatus() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const serviceName = config.hermesServiceName || "hermes";
  const serviceActive = await checkServiceActive(serviceName);

  return {
    uptime: os.uptime(),
    platform: `${os.type()} ${os.release()} (${os.arch()})`,
    memoryUsage: {
      totalMb: formatBytesToMb(totalMem),
      freeMb: formatBytesToMb(freeMem),
      usedMb: formatBytesToMb(usedMem),
      percentage: Math.round((usedMem / totalMem) * 100),
    },
    serviceName,
    serviceActive,
  };
}

async function restartService() {
  const serviceName = config.hermesServiceName || "hermes";
  return executeCommand(`sudo systemctl restart ${serviceName}`);
}

module.exports = {
  getSystemStatus,
  executeCommand,
  restartService,
  truncateOutput,
};
