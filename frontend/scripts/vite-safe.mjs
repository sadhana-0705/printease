import childProcess from "node:child_process";
import { EventEmitter } from "node:events";
import { syncBuiltinESMExports } from "node:module";

const originalExec = childProcess.exec;

function createNoopChildProcess() {
  const child = new EventEmitter();
  child.pid = 0;
  child.killed = false;
  child.kill = () => false;
  child.stdin = null;
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  return child;
}

childProcess.exec = function patchedExec(command, ...args) {
  if (process.platform === "win32" && typeof command === "string" && command.trim().toLowerCase() === "net use") {
    const callback = args.find((value) => typeof value === "function");
    const child = createNoopChildProcess();

    queueMicrotask(() => {
      if (callback) {
        callback(null, "", "");
      }
      child.emit("exit", 0, null);
      child.emit("close", 0, null);
    });

    return child;
  }

  return originalExec.call(childProcess, command, ...args);
};

syncBuiltinESMExports();

await import("vite");
