import { command } from "../utils/command/command";
import init from "./init/index";

export default command({
  name: "server",
  usage: "lostdock server <command>",
  description: "Manage your server installation",
  subcommands: [init],
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
