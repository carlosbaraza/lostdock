import path from "path";
import { config } from "../../lib/config/config";
import { withSSH } from "../../lib/RunAsyncScript";
import command from "./index";

export const script = withSSH<typeof command.definition.options>(async (options) => {
  const { setStatus, getOptionValue, ssh } = options;

  const { verbose } = config();

  const stack = getOptionValue("stack");

  let ignoreRegex: RegExp | undefined;
  const ignoreRegexString = getOptionValue("ignore"); // format "/test/i"
  if (ignoreRegexString && typeof ignoreRegexString === "string") {
    const match = ignoreRegexString.match(/^\/(.+)\/([a-z]*)$/);
    const ignoreRegexBody = match && match[1];
    const ignoreRegexFlags = (match && match[2]) || "";
    if (ignoreRegexBody) {
      ignoreRegex = new RegExp(ignoreRegexBody, ignoreRegexFlags);
    }
  }

  const remotePath = path.join(config().server.stacksPath, stack);
  setStatus(`Downloading stack files from the server at "${remotePath}" into current directory`);
  await ssh.getDirectory(".", remotePath, {
    validate: (itemPath) => {
      let validated = true;
      if (ignoreRegex && ignoreRegex.test(itemPath)) {
        validated = false;
      }
      if (itemPath.includes("node_modules")) {
        validated = false;
      }
      if (verbose) {
        console.log(`Validating ${itemPath} (${validated ? "Valid ✅" : "Ignored ❌"})`);
      }
      return validated;
    },
  });
});
