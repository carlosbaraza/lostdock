import chalk from "chalk";
import path from "path";
import { config } from "../../config";
import { execLocal } from "../../utils/exec-local";
import { withSSH } from "../../utils/RunAsyncScript";
import { exec } from "../../utils/ssh/ssh";
import command from "./index";

export const script = withSSH<typeof command.definition.options>(async (options) => {
  const { setStatus, getOptionValue, ssh } = options;
  const stack = getOptionValue("stack");
  const remotePath = path.join(config().server.stacksPath, stack);

  setStatus('Running "install-local.sh" script');
  await execLocal("./install-local.sh", {
    log: options.log,
  });

  setStatus(`Uploading stack files to the server at "${remotePath}"`);
  await ssh.putDirectory(".", remotePath, {
    validate: (itemPath) => {
      return !itemPath.includes("node_modules");
    },
    recursive: true,
    concurrency: 10,
    tick(localFile, remoteFile, error) {
      if (error) {
        console.error(chalk.red(`Error uploading "${localFile}" to "${remoteFile}"`));
      } else {
        options.log(`Uploaded "${localFile}" to "${remoteFile}"`);
      }
    },
  });

  setStatus('Running "install-server.sh" script');
  await exec(ssh, `chmod +x ./install-server.sh`, {
    cwd: remotePath,
    log: options.log,
  });
  await exec(ssh, `./install-server.sh`, {
    cwd: remotePath,
    log: options.log,
  });

  setStatus("Starting stack (docker compose up -d --force-recreate)");
  await exec(ssh, `docker compose up -d --force-recreate`, {
    cwd: remotePath,
    log: options.log,
  });
});
