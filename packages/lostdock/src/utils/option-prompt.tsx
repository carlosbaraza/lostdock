#!/usr/bin/env node

import chalk from "chalk";
import { Box, render, Text, useApp } from "ink";
import TextInput from "ink-text-input";
import React, { useState } from "react";

type Option = { key: string; name: string; value: string };
type OptionResult = Array<Option>;

export async function optionPrompt(
	fields: Array<Omit<Option, "value"> & { value?: string }>
) {
	let output: OptionResult = [];
	if (fields.length === 0) {
		return output;
	}

	const Prompt = () => {
		const { exit } = useApp();
		const [config, setConfig] = useState<Array<Option>>([]);
		const [index, setIndex] = useState(0);
		const [input, setInput] = useState(fields[index]!.value || "");

		const key = fields[index]!.key;
		const name = fields[index]!.name;

		const onSubmit = (value: string) => {
			const newConfig = [
				...config,
				{
					key,
					name,
					value,
				},
			];
			if (index < fields.length - 1) {
				console.log(`${name}: ${value}`);
				setConfig(newConfig);
				setIndex(index + 1);
				setInput("");
			} else {
				output = newConfig;
				exit();
			}
		};

		return (
			<Box>
				<Box marginRight={1}>
					<Text>{name}:</Text>
				</Box>
				<TextInput value={input} onChange={setInput} onSubmit={onSubmit} />
			</Box>
		);
	};

	console.log(
		chalk.yellow(
			"Some options are missing and required to continue. Please provide them below:"
		)
	);
	await render(<Prompt />).waitUntilExit();

	if (!output.length) {
		console.error("Not enough options provided. Aborting.");
		process.exit(1);
	}

	return output;
}
