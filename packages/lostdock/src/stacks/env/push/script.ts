import path from "path";
import { config } from "../../../lib/config/config";
import { withSSH } from "../../../lib/RunAsyncScript";
import { exec } from "../../../lib/ssh/ssh";
import command from "./index";

export const script = withSSH<typeof command.definition.options>(async (options) => {
  const { setStatus, getOptionValue, ssh, log } = options;

  const stack = getOptionValue("stack");
  const restart = getOptionValue("restart");

  const remotePath = path.join(config().server.stacksPath, stack);

  const remoteEnvPath = path.join(remotePath, ".env");
  setStatus(`Pushing local stack .env to "${remoteEnvPath}"`);
  await ssh.putFile(".env", remoteEnvPath);

  if (restart) {
    setStatus("Restarting stack (docker compose up -d --force-recreate)");
    await exec(ssh, `docker compose up -d --force-recreate`, {
      cwd: remotePath,
      log,
    });
  } else {
    setStatus("Skipping restart. You can manually restart the stack with `lostdock stacks up`");
  }
});
