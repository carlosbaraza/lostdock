#!/usr/bin/env node

import { render } from "ink";
import React from "react";
import { config } from "../../lib/config/config";
import { command } from "../../lib/command/command";
import { promptMissingOptions } from "../../lib/prompt-missing-options";
import { RunAsyncScript } from "../../lib/RunAsyncScript";
import { script } from "./script";

export default command({
  name: "install",
  usage: "lostdock stacks install",
  description: "Install the current folder stack in your server",
  subcommands: [],
  options: [
    {
      key: "stack",
      alias: "s",
      type: "string",
      description: "stack name (e.g. example-stack-production)",
      prompt: true,
      configValue: () => config().stack.name,
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
