import readline from "readline";
import { Readable } from "stream";

export function createLogPreviewStream(
  /** Callback would be called with a fix number of logs to preview */
  log: (log: string) => void
) {
  const output = new Readable({
    read() {},
  });
  const outputLines = readline.createInterface({
    input: output,
    crlfDelay: Infinity,
  });
  outputLines.on("line", log);
  return output;
}
