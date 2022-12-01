#!/usr/bin/env node

import { render } from "ink";
import { command } from "../../lib/command/command";
import { promptMissingOptions } from "../../lib/prompt-missing-options";
import { RunAsyncScript } from "../../lib/RunAsyncScript";
import { script } from "./script";

export default command({
  name: "set-default",
  usage: "lostdock login set-default",
  description: "Set default login from your logins: ~/.lostdock/logins.json",
  subcommands: [],
  options: [
    {
      key: "host",
      type: "string",
      isRequired: false,
      description:
        "Your server's hostname (e.g. server.example.com). An IP address is also acceptable.",
      prompt: true,
    },
    {
      key: "help",
      alias: "h",
      description: "Show help",
      type: "boolean",
    },
  ],
  commandDepth: 2,
  run: async (cli, command) => {
    const { getOptionValue } = await promptMissingOptions(command.options, cli);
    render(<RunAsyncScript script={script} getOptionValue={getOptionValue} />);
  },
});
