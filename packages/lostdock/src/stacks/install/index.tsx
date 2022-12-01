#!/usr/bin/env node

import { render } from "ink";
import React from "react";
import { config } from "../../config";
import { command } from "../../utils/command/command";
import { promptMissingOptions } from "../../utils/prompt-missing-options";
import { RunAsyncScript } from "../../utils/RunAsyncScript";
import { script } from "./script";

export default command({
  name: "install",
  usage: "lostdock stacks install",
  description: "Run `docker compose install` for the stack in the server",
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