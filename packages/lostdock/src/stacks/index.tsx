import { command } from "../lib/command/command";
import env from "./env/index";
import push from "./push/index";
import pull from "./pull/index";
import install from "./install/index";
import installFromGit from "./install-from-git/index";
import up from "./up/index";
import down from "./down/index";
import create from "./create/index";
import compose from "./compose/index";

export default command({
  name: "stacks",
  usage: "lostdock stacks <command>",
  description: "Manage your stacks on the server",
  subcommands: [create, pull, push, env, install, installFromGit, up, down, compose],
  options: [
    {
      key: "help",
      alias: "h",
      description: "Show help",
      type: "boolean",
    },
  ],
  commandDepth: 1,
});
