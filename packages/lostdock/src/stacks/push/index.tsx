#!/usr/bin/env node

import { render } from "ink";
import React from "react";
import { config } from "../../config";
import { command } from "../../utils/command/command";
import { promptMissingOptions } from "../../utils/prompt-missing-options";
import { RunAsyncScript } from "../../utils/RunAsyncScript";
import { script } from "./script";

export default command({
	name: "push",
	usage: "lostdock stacks push",
	description: `Push the stack configuration to the server. All the files in the stack directory will be uploaded to the server. It is recommended to have a folder with the minimal data needed to run the stack: docker-compose.yml, .env, etc.`,
	subcommands: [],
	options: [
		{
			key: "stack",
			type: "string",
			description: "stack name (e.g. example-stack-production)",
			prompt: true,
			configValue: config.stack.name,
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
