#!/usr/bin/env node

import { render } from "ink";
import { command } from "../lib/command/command";
import { promptMissingOptions } from "../lib/prompt-missing-options";
import { RunAsyncScript } from "../lib/RunAsyncScript";
import { script } from "./script";
import os from "os";
import path from "path";
import { config } from "../lib/config/config";
import setDefault from "./set-default";

export default command({
  name: "login",
  usage: "lostdock login",
  description: "Login to your server. Store the login config in ~/.lostdock/logins.json",
  subcommands: [setDefault],
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
      key: "user",
      type: "string",
      isRequired: false,
      description: "Your SSH username (e.g. root).",
      prompt: true,
      default: "root",
    },
    {
      key: "privateKeyPath",
      type: "string",
      isRequired: false,
      description: "Your SSH private key (e.g. ~/.ssh/id_rsa).",
      default: `${path.join(os.homedir(), ".ssh/id_rsa")}`,
      prompt: true,
    },
    {
      key: "whoami",
      alias: "w",
      description: "Show current login configuration",
      type: "boolean",
    },
    {
      key: "list",
      alias: "l",
      description: "Show all saved login configurations",
      type: "boolean",
    },
    {
      key: "help",
      alias: "h",
      description: "Show help",
      type: "boolean",
    },
  ],
  commandDepth: 1,
  run: async (cli, command) => {
    if (cli.flags.whoami) {
      console.log(JSON.stringify(config().logins.defaultLogin, null, 2));
      process.exit(0);
    }

    if (cli.flags.list) {
      console.log(JSON.stringify(config().logins.logins, null, 2));
      process.exit(0);
    }

    const { getOptionValue } = await promptMissingOptions(command.options, cli);

    render(<RunAsyncScript script={script} getOptionValue={getOptionValue} />);
  },
});
