#!/usr/bin/env node

import { command } from "./lib/command/command";
import server from "./server/index";
import stacks from "./stacks/index";
import login from "./login/index";
import logout from "./logout/index";

const { run } = command({
  name: "lostdock",
  usage: "lostdock <command>",
  description: "Deploy your docker compose stacks to a VPS",
  subcommands: [
    stacks,
    server,
    {
      name: "init",
      description: "TODO: Create the initial .lostdockrc.json file",
      run: () => {
        console.log("TODO: Create the initial .lostdockrc.json file");
      },
    },
    login,
    logout,
  ],
  options: [
    {
      key: "help",
      alias: "h",
      description: "Show help",
      type: "boolean",
    },
    {
      key: "version",
      alias: "v",
      description: "Show version",
      type: "boolean",
    },
  ],
  commandDepth: 0,
});

run();
