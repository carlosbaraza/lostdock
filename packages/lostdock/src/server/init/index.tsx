#!/usr/bin/env node

import { render } from "ink";
import { command } from "../../lib/command/command";
import { promptMissingOptions } from "../../lib/prompt-missing-options";
import { RunAsyncScript } from "../../lib/RunAsyncScript";
import { init } from "./init";

export default command({
  name: "init",
  usage: "lostdock server init",
  description: "Initialize a server. Install dependencies, Docker, Traefik, enable firewall.",
  subcommands: [],
  options: [
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

    render(<RunAsyncScript script={init} getOptionValue={getOptionValue} />);
  },
});
