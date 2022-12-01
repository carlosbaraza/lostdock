import { command } from "../../lib/command/command";
import pull from "./pull/index";
import push from "./push/index";
import view from "./view/index";
import set from "./set/index";
import unset from "./unset/index";

export default command({
  name: "env",
  usage: "lostdock stacks env <command>",
  description: "Manage your stack .env files on the server",
  subcommands: [pull, push, view, set, unset],
  options: [
    {
      key: "help",
      alias: "h",
      description: "Show help",
      type: "boolean",
    },
  ],
  commandDepth: 2,
});
