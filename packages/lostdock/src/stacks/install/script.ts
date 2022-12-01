import chalk from "chalk";
import { NodeSSH } from "node-ssh";
import path from "path";
import { config } from "../../lib/config/config";
import { execLocal } from "../../lib/exec-local";
import { withSSH } from "../../lib/RunAsyncScript";
import { exec } from "../../lib/ssh/ssh";
import command from "./index";

export const script = withSSH<typeof command.definition.options>(async (options) => {
  const { setStatus, getOptionValue, ssh, log } = options;
  const stackName = getOptionValue("stack");
  await install({ setStatus, ssh, stackName, log });
});

export const install = async ({
  setStatus,
  ssh,
  stackName,
  log,
}: {
  setStatus: (status: string) => void;
  ssh: NodeSSH;
  stackName: string;
  log: (message: string | null) => void;
}) => {
  const remotePath = path.join(config().server.stacksPath, stackName);

  setStatus('Running "install-local.sh" script');
  await execLocal("./install-local.sh", {
    log,
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
        log(`Uploaded "${localFile}" to "${remoteFile}"`);
      }
    },
  });

  setStatus('Running "install-server.sh" script');
  await exec(ssh, `chmod +x ./install-server.sh`, {
    cwd: remotePath,
    log,
  });
  await exec(ssh, `./install-server.sh`, {
    cwd: remotePath,
    log,
  });

  setStatus("Starting stack (docker compose up -d --force-recreate)");
  await exec(ssh, `docker compose up -d --force-recreate`, {
    cwd: remotePath,
    log,
  });
};
