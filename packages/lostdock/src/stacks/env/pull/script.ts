import path from "path";
import { config } from "../../../lib/config/config";
import { withSSH } from "../../../lib/RunAsyncScript";
import command from "./index";

export const script = withSSH<typeof command.definition.options>(async (options) => {
  const { setStatus, getOptionValue, ssh } = options;

  const stack = getOptionValue("stack");

  const remoteEnvPath = path.join(config().server.stacksPath, stack, ".env");
  setStatus(`Getting stack .env "${remoteEnvPath}"`);
  try {
    await ssh.getFile(".env", remoteEnvPath);
  } catch (error: any) {
    if (getOptionValue("silent") && error?.message?.includes("No such file")) {
      return;
    }
    throw error;
  }
});
