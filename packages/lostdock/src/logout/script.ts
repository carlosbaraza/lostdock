import chalk from "chalk";
import fs from "fs";
import { config } from "../lib/config/config";
import { AsyncScript } from "../lib/RunAsyncScript";
import command from "./index";

export const script: AsyncScript<typeof command.definition.options> = async ({
  setStatus,
  log,
  getOptionValue,
  setLoading,
}) => {
  const loginPath = config({ validate: false }).loginsPath;
  setStatus(`Removing all logins from "${loginPath}"`);

  fs.existsSync(loginPath) && fs.writeFileSync(loginPath, "[]");

  setLoading(false);
  setStatus(chalk.green("Success"));
  setTimeout(() => {
    process.exit(0);
  }, 500);
};
