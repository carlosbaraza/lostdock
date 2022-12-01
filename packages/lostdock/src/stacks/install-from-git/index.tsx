#!/usr/bin/env node

import { render } from "ink";
import { command } from "../../lib/command/command";
import { promptMissingOptions } from "../../lib/prompt-missing-options";
import { RunAsyncScript } from "../../lib/RunAsyncScript";
import { script } from "./script";

export default command({
  name: "install-from-git",
  usage: "lostdock stacks install-from-git",
  description: "Clone the repository and install the stack",
  subcommands: [],
  options: [
    {
      key: "url",
      alias: "u",
      description: "Git repository URL. E.g. https://github.com/carlosbaraza/lostdock.git",
      type: "string",
      prompt: true,
      isRequired: true,
    },
    {
      key: "path",
      alias: "p",
      description:
        "Relative path within the repository where the stack is located. E.g. ./packages/lostdock-monitoring",
      type: "string",
      prompt: false,
      isRequired: false,
      configValue: () => ".",
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
