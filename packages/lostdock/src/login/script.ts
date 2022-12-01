import path from "path";
import fs from "fs";
import chalk from "chalk";
import { enableRemoteRsaKey, exec, getSshClient } from "../lib/ssh/ssh";
import { AsyncScript } from "../lib/RunAsyncScript";
import command from "./index";
import { config } from "../lib/config/config";
import { NodeSSH } from "node-ssh";
import { addLogin } from "../lib/config/logins";

export const script: AsyncScript<typeof command.definition.options> = async ({
  setStatus,
  log,
  getOptionValue,
  setLoading,
}) => {
  setStatus(
    `Getting SSH connection configuration. It will be stored in "${
      config({ validate: false }).loginsPath
    }"`
  );

  setStatus("Getting host");
  const host = getOptionValue("host");
  setStatus(`Host: ${host}`);

  setStatus("Getting private SSH key path");
  const privateKeyPath = getOptionValue("privateKeyPath");
  setStatus(`privateKeyPath: ${privateKeyPath}`);

  setStatus("Getting user");
  const user = getOptionValue("user");
  setStatus(`User: ${user}`);

  await setStatus("Enabling RSA SSH Keys in remote server");
  await enableRemoteRsaKey({
    host,
    privateKeyPath,
    user,
  });

  setStatus("Testing SSH connection");
  const ssh = new NodeSSH();
  await ssh.connect({
    host,
    username: user,
    privateKey: fs.readFileSync(path.resolve(privateKeyPath)).toString(),
  });

  setStatus(`Storing SSH connection configuration in "${config({ validate: false }).loginsPath}"`);
  addLogin({
    ssh: {
      host,
      privateKeyPath,
      user,
    },
  });

  setLoading(false);
  setStatus(chalk.green("Success"));
  process.exit(0);
};
