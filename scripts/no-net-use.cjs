const childProcess = require("node:child_process");

const originalExec = childProcess.exec;

childProcess.exec = function patchedExec(command, options, callback) {
  if (
    process.platform === "win32" &&
    typeof command === "string" &&
    command.trim().toLowerCase() === "net use"
  ) {
    let cb = callback;
    let execOptions = options;

    if (typeof execOptions === "function") {
      cb = execOptions;
      execOptions = undefined;
    }

    if (typeof cb === "function") {
      const error = new Error("Skipped Windows net use probe for Astro build");
      error.code = "EPERM";
      process.nextTick(() => cb(error, "", ""));
    }

    return {
      pid: 0,
      stdout: null,
      stderr: null,
      kill() {},
    };
  }

  return originalExec.call(childProcess, command, options, callback);
};
