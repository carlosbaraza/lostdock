import { command } from "../utils/command/command";
import init from "./init/index";

export default command({
	name: "vps",
	usage: "lostdock vps <command>",
	description: "Manage your VPS",
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
