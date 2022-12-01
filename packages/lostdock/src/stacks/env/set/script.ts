import path from "path";
import fs from "fs";
import { config } from "../../../lib/config/config";
import { dotenvFormat } from "../../../lib/dotenv/format";
import { dotenvParse } from "../../../lib/dotenv/parse";
import { withSSH } from "../../../lib/RunAsyncScript";
import { getRemoteFile } from "../../../lib/ssh/get-remote-file";
import { putRemoteFile } from "../../../lib/ssh/put-remote-file";
import command from "./index";
import { exec } from "../../../lib/ssh/ssh";

export const script = withSSH<typeof command.definition.options>(async (options) => {
  const { setStatus, getOptionValue, ssh, log } = options;

  const stack = getOptionValue("stack");
  const key = getOptionValue("key");
  const value = getOptionValue("value");

  const remotePath = path.join(config().server.stacksPath, stack);
  const remoteEnvPath = path.join(remotePath, ".env");
  setStatus(`Getting stack .env "${remoteEnvPath}"`);
  const dotenv = await getRemoteFile(ssh, remoteEnvPath);

  setStatus(`Setting stack .env "${remoteEnvPath}"`);
  const newDotenv = {
    ...dotenvParse(dotenv),
    [key]: value,
  };
  const formattedEnv = dotenvFormat(newDotenv);
  await putRemoteFile(ssh, remoteEnvPath, formattedEnv);

  setStatus("Restarting stack (docker compose up -d --force-recreate)");
  await exec(ssh, `docker compose up -d --force-recreate`, {
    cwd: remotePath,
    log,
  });
});
