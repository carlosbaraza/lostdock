import { command } from "../utils/command/command";
import env from "./env/index";
import push from "./push/index";
import pull from "./pull/index";
import up from "./up/index";
import down from "./down/index";
import compose from "./compose/index";

export default command({
	name: "stacks",
	usage: "lostdock stacks <command>",
	description: "Manage your stacks on the server",
	subcommands: [
		{
			name: "create",
			description:
				"TODO: Create a new stack folder with Docker Compose example.",
			run: () => {
				console.log(
					"TODO: Create a new stack folder with Docker Compose example."
				);
			},
		},
		pull,
		push,
		env,
		up,
		down,
		compose,
	],
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
