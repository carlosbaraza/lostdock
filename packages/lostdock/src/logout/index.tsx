#!/usr/bin/env node

import { render } from "ink";
import { command } from "../lib/command/command";
import { promptMissingOptions } from "../lib/prompt-missing-options";
import { RunAsyncScript } from "../lib/RunAsyncScript";
import { script } from "./script";

export default command({
  name: "logout",
  usage: "lostdock logout",
  description: "Remove all logins from ~/.lostdock/logins.json",
  subcommands: [],
  options: [
    {
      key: "help",
      alias: "h",
      description: "Show help",
      type: "boolean",
    },
  ],
  commandDepth: 1,
  run: async (cli, command) => {
    const { getOptionValue } = await promptMissingOptions(command.options, cli);

    render(<RunAsyncScript script={script} getOptionValue={getOptionValue} />);
  },
});
