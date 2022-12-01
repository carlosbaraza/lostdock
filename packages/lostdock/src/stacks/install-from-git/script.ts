import chalk from "chalk";
import path from "path";
import fs from "fs";
import { config } from "../../lib/config/config";
import { execLocal } from "../../lib/exec-local";
import { withSSH } from "../../lib/RunAsyncScript";
import { exec } from "../../lib/ssh/ssh";
import command from "./index";
import { v4 as uuidv4 } from "uuid";
import { install } from "../install/script";

export const script = withSSH<typeof command.definition.options>(async (options) => {
  const { setStatus, getOptionValue, ssh, log } = options;

  // Clone the repository and move to the right stack directory
  const url = getOptionValue("url");
  const stacksPath = config().logins.defaultLogin.global.stacks.path;
  const tmpUUID = uuidv4();
  const tmpPath = path.join(stacksPath, tmpUUID);

  let stackPath: string | undefined;
  try {
    setStatus(`Temporarily cloning repository into "${tmpPath}"`);
    await execLocal(`git clone ${url} ${tmpPath}`, { log });

    setStatus(`Checking the stack configuration`);
    const stackRelativePath = getOptionValue("path");
    const tmpStackPath = path.join(tmpPath, stackRelativePath);
    const tmpStackConfigPath = path.resolve(tmpStackPath, ".lostdockrc.json");
    const stackConfig = fs.readFileSync(tmpStackConfigPath, "utf8");
    const stackConfigParsed = JSON.parse(stackConfig);
    const stackName = stackConfigParsed?.stack?.name;
    if (!stackName) {
      throw new Error(`Stack name not found in "${tmpStackConfigPath}"`);
    }
    stackPath = path.join(stacksPath, stackName);
    if (fs.existsSync(stackPath)) {
      throw new Error(`Stack "${stackName}" already exists`);
    }

    setStatus(`Moving stack from "${tmpStackPath}" to "${stackPath}"`);
    await execLocal(`mv ${tmpStackPath} ${stackPath}`, { log });

    setStatus(`Removing temporary directory "${tmpPath}"`);
    await execLocal(`rm -rf ${tmpPath}`, { log });

    process.chdir(stackPath);

    setStatus(`Installing stack "${stackName}"`);
    await install({ setStatus, ssh, stackName, log });
  } catch (e: any) {
    console.error(`Cleanup after error: ${e.message}`);
    console.error(`Removing temporary directory "${tmpPath}"`);
    await execLocal(`rm -rf ${tmpPath}`, { log });
    if (stackPath) {
      console.error(`Removing temporary directory "${stackPath}"`);
      await execLocal(`rm -rf ${stackPath}`, { log });
    }
    throw e;
  }
});
