#!/usr/bin/env node

import { render } from "ink";
import React from "react";
import { config } from "../../../lib/config/config";
import { command } from "../../../lib/command/command";
import { promptMissingOptions } from "../../../lib/prompt-missing-options";
import { RunAsyncScript } from "../../../lib/RunAsyncScript";
import { script } from "./script";

export default command({
  name: "pull",
  usage: "lostdock stacks env pull",
  description: "Download the current .env file",
  subcommands: [],
  options: [
    {
      key: "stack",
      type: "string",
      alias: "s",
      isRequired: false,
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
  commandDepth: 3,
  run: async (cli, command) => {
    const { getOptionValue } = await promptMissingOptions(command.options, cli);

    render(<RunAsyncScript script={script} getOptionValue={getOptionValue} />);
  },
});
