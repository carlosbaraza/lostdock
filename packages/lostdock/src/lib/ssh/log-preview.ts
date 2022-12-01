import readline from "readline";
import { Readable } from "stream";

export function createLogPreviewStream(
  /** Callback would be called with a fix number of logs to preview */
  log?: (log: string) => void
) {
  let logs: string[] = [];

  const output = new Readable({
    read() {},
  });
  const outputLines = readline.createInterface({
    input: output,
    crlfDelay: Infinity,
  });
  outputLines.on("line", (line) => {
    logs.push(line);
    log?.(line);
  });

  return {
    logs,
    logStream: output,
  };
}
