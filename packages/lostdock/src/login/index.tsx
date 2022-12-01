#!/usr/bin/env node

import { render } from "ink";
import { command } from "../utils/command/command";
import { promptMissingOptions } from "../utils/prompt-missing-options";
import { RunAsyncScript } from "../utils/RunAsyncScript";
import { script } from "./script";
import os from "os";
import path from "path";
import { config } from "../config";

export default command({
  name: "login",
  usage: "lostdock login",
  description: "Login to your server. Store the login config in ~/.lostdock/logins.json",
  subcommands: [],
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
      key: "help",
      alias: "h",
      description: "Show help",
      type: "boolean",
    },
  ],
  commandDepth: 2,
  run: async (cli, command) => {
    if (cli.flags.whoami) {
      console.log(JSON.stringify(config().ssh, null, 2));
      process.exit(0);
    }

    const { getOptionValue } = await promptMissingOptions(command.options, cli);

    render(<RunAsyncScript script={script} getOptionValue={getOptionValue} />);
  },
});
