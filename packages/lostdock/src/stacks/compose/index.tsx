#!/usr/bin/env node

import { render } from "ink";
import React from "react";
import { config } from "../../config";
import { command } from "../../utils/command/command";
import { promptMissingOptions } from "../../utils/prompt-missing-options";
import { RunAsyncScript, withSSH } from "../../utils/RunAsyncScript";
import path from "path";
import { exec } from "../../utils/ssh/ssh";

export default command({
	name: "compose",
	usage: "lostdock stacks compose -- [docker-compose-args]",
	description:
		"Run `docker compose` for the stack in the server. You can specify any docker compose command after this command.",
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

		const dockerComposeCommand = cli.input.slice(2).join(" ");

		render(
			<RunAsyncScript
				script={withSSH<typeof command.options>(async (options) => {
					const { setStatus, getOptionValue, ssh } = options;
					const stack = getOptionValue("stack");
					const remotePath = path.join(config.server.stacksPath, stack);

					setStatus(`Running docker compose command in "${remotePath}"`);

					const fullComposeCommand = `docker compose ${dockerComposeCommand}`;
					console.log(`Running "${fullComposeCommand}"`);

					await exec(ssh, fullComposeCommand, {
						cwd: remotePath,
						showStdout: true,
					});
				})}
				getOptionValue={getOptionValue}
			/>
		);
	},
});
