#!/usr/bin/env node

import { render } from "ink";
import React from "react";
import { config } from "../../../lib/config/config";
import { command } from "../../../lib/command/command";
import { promptMissingOptions } from "../../../lib/prompt-missing-options";
import { RunAsyncScript } from "../../../lib/RunAsyncScript";
import { script } from "./script";

export default command({
  name: "unset",
  usage: "lostdock stacks env unset",
  description: "Unset an environment variable in your remote stack. The stack will be restarted.",
  subcommands: [],
  options: [
    {
      key: "key",
      type: "string",
      alias: "k",
      isRequired: false,
      description: "The environment variable key",
      prompt: true,
      configValue: () => config().stack.name,
    },
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
      key: "local",
      type: "boolean",
      alias: "l",
      isRequired: false,
      description: "Set the local .env (default: set remotely only)",
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
