import path from "path";
import { config } from "../../config";
import { withSSH } from "../../utils/RunAsyncScript";
import command from "./index";

export const script = withSSH<typeof command.definition.options>(async (options) => {
  const { setStatus, getOptionValue, ssh } = options;

  const stack = getOptionValue("stack");

  const remotePath = path.join(config().server.stacksPath, stack);
  setStatus(`Downloading stack files from the server at "${remotePath}" into current directory`);
  await ssh.getDirectory(".", remotePath, {
    validate: (itemPath) => {
      return !itemPath.includes("node_modules");
    },
  });
});
