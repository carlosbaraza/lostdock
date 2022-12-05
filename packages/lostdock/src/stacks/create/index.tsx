#!/usr/bin/env node

import { render } from "ink";
import { command } from "../../lib/command/command";
import { promptMissingOptions } from "../../lib/prompt-missing-options";
import { RunAsyncScript } from "../../lib/RunAsyncScript";
import { script } from "./script";

export default command({
  name: "create",
  usage: "lostdock stacks create",
  description:
    "Create the basic configuration files for a stack (.lostdockrc.json, docker-compose.yml, .env). Nothing will be deployed to the server.",
  subcommands: [],
  options: [
    {
      key: "name",
      type: "string",
      alias: "n",
      isRequired: false,
      description: "stack name (e.g. example-stack-production)",
      prompt: true,
    },
    {
      key: "path",
      type: "string",
      alias: "p",
      isRequired: false,
      description:
        "Where to add the configuration files. By the default, a folder with the stack name would be created in the current directory.",
      prompt: false,
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
