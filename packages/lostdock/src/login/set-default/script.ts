import chalk from "chalk";
import { config } from "../../lib/config/config";
import { makeLoginDefault } from "../../lib/config/logins";
import { AsyncScript } from "../../lib/RunAsyncScript";
import command from "./index";

export const script: AsyncScript<typeof command.definition.options> = async ({
  setStatus,
  getOptionValue,
  setLoading,
}) => {
  setStatus("Getting host");
  const host = getOptionValue("host");
  setStatus(`Host: ${host}`);

  setStatus(`Setting default login in "${config().loginsPath}"`);
  makeLoginDefault(host);

  setLoading(false);
  setStatus(chalk.green("Success"));
  setImmediate(() => process.exit(0));
};
