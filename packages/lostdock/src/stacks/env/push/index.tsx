#!/usr/bin/env node

import { render } from "ink";
import React from "react";
import { config } from "../../../lib/config/config";
import { command } from "../../../lib/command/command";
import { promptMissingOptions } from "../../../lib/prompt-missing-options";
import { RunAsyncScript } from "../../../lib/RunAsyncScript";
import { script } from "./script";

export default command({
  name: "push",
  usage: "lostdock stacks env push",
  description: "Upload the local .env file",
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
      key: "restart",
      type: "boolean",
      alias: "r",
      isRequired: false,
      description: "Restart the stack after setting the environment variable",
      default: false,
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
