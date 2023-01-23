#!/usr/bin/env node

import { render } from "ink";
import React from "react";
import { config } from "../../lib/config/config";
import { command } from "../../lib/command/command";
import { promptMissingOptions } from "../../lib/prompt-missing-options";
import { RunAsyncScript } from "../../lib/RunAsyncScript";
import { script } from "./script";

export default command({
  name: "push",
  usage: "lostdock stacks push",
  description: `Push the stack configuration to the server. All the files in the stack directory will be uploaded to the server. It is recommended to have a folder with the minimal data needed to run the stack: docker-compose.yml, .env, etc.`,
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
    {
      key: "ignore",
      type: "string",
      alias: "i",
      isRequired: false,
      description: 'Ignore paths matching JS regex (e.g. -i "/postgres/")',
    },
  ],
  commandDepth: 2,
  run: async (cli, command) => {
    const { getOptionValue } = await promptMissingOptions(command.options, cli);

    render(<RunAsyncScript script={script} getOptionValue={getOptionValue} />);
  },
});
