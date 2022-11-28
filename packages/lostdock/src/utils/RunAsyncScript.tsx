import Spinner from "ink-spinner";
import React from "react";
import { useEffect, useState } from "react";
import { config } from "../config";
import { GetOptionValue } from "./prompt-missing-options";
import { Text } from "ink";
import { getSshClient } from "../utils/ssh/ssh";
import { NodeSSH } from "node-ssh";
import chalk from "chalk";
import { Option } from "./command/command";

export type AsyncScript<
	O extends Option<OptionKey>[],
	OptionKey extends string = O[number]["key"],
	C = AsyncScriptConfig<O, OptionKey>
> = (config: C) => void;

export type AsyncScriptConfig<
	O extends Option<OptionKey>[],
	OptionKey extends string
> = {
	setStatus: (status: string) => void;
	getOptionValue: GetOptionValue<O, any>;
	setLoading: (loading: boolean) => void;
};

type AsyncScriptWithSSH<
	O extends Option<OptionKey>[],
	OptionKey extends string
> = AsyncScript<
	O,
	OptionKey,
	AsyncScriptConfig<O, OptionKey> & { ssh: NodeSSH }
>;

export function withSSH<
	O extends Option<OptionKey>[],
	OptionKey extends string = O[number]["key"],
	S extends AsyncScriptWithSSH<O, OptionKey> = AsyncScriptWithSSH<O, OptionKey>
>(script: S) {
	const wrappedScript: AsyncScript<O, OptionKey> = async (props) => {
		props.setStatus("Preparing SSH client");
		const ssh = await getSshClient();
		await script({ ...props, ssh });
	};
	return wrappedScript;
}

export function RunAsyncScript<
	O extends Option<OptionKey>[],
	OptionKey extends string
>(props: {
	getOptionValue: GetOptionValue<O, OptionKey>;
	script: AsyncScript<O, OptionKey>;
}) {
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("Starting");

	const setStatus = (status: string) => {
		setMessage((prevMessage) => {
			if (prevMessage !== "Starting") {
				console.log("✔ " + prevMessage);
			}
			return status;
		});
	};

	useEffect(() => {
		async function runScript() {
			await props.script({
				setLoading,
				setStatus,
				getOptionValue: props.getOptionValue,
			});

			setLoading(false);
			setStatus(chalk.green("Done"));
			process.exit(0);
		}
		runScript();
	}, []);

	return (
		<Text color="yellow">
			{loading && !config.verbose ? (
				<>
					<Spinner type="dots" />{" "}
				</>
			) : null}
			{message}
		</Text>
	);
}
