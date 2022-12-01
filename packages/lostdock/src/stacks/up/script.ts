import path from "path";
import { config } from "../../lib/config/config";
import { withSSH } from "../../lib/RunAsyncScript";
import { exec } from "../../lib/ssh/ssh";
import command from "./index";

export const script = withSSH<typeof command.definition.options>(async (options) => {
  const { setStatus, getOptionValue, ssh } = options;
  const stack = getOptionValue("stack");
  const remotePath = path.join(config().server.stacksPath, stack);

  setStatus("Starting stack (docker compose up -d --force-recreate)");
  await exec(ssh, `docker compose up -d --force-recreate`, {
    cwd: remotePath,
    log: options.log,
  });
});
