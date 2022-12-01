import chalk from "chalk";
import shell from "shelljs";
import { config } from "../config";
import { createLogPreviewStream } from "./ssh/log-preview";

export async function execLocal(
  command: string,
  options: {
    cwd?: string;
    verbose?: boolean;
    log?: (log: string | null) => void;
    exitOnError?: boolean;
  } = {}
) {
  const defaults = {
    verbose: config().verbose,
    exitOnError: true,
  };
  const { cwd, verbose, log, exitOnError } = { ...defaults, ...options };

  let { logStream, logs } = createLogPreviewStream(log);

  const installResult = shell.exec(command, {
    shell: "/bin/bash",
    cwd,
    async: true,
  });
  // log child process stream stdout and stderr
  installResult.stdout?.on("data", (data) => {
    logStream?.push(data);
    if (verbose) {
      process.stdout.write(data);
    }
  });
  installResult.stderr?.on("data", (data) => {
    logStream?.push(data);
    if (verbose) {
      process.stdout.write(data);
    }
  });
  // await for child process to exit
  const exitCode = await new Promise<number>((resolve) => {
    installResult.on("exit", (code) => {
      resolve(code || 0);
    });
  });

  if (exitOnError && exitCode !== 0) {
    console.error(chalk.red(`Command "${command}" failed with exit code: ` + exitCode));
    console.log(chalk.red(logs.join("\n")));
    process.exit(exitCode || 1);
  }

  log?.(null);
  return {
    logs,
    code: exitCode,
  };
}
