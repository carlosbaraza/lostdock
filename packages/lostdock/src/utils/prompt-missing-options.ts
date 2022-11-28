import { optionPrompt } from "./option-prompt";
import { Option } from "./command/command";

export type GetOptionValue<O = any, T = any> = (
	key: O extends Option<infer K>[] ? K : never
) => T;

export async function promptMissingOptions<
	O extends Option<K>[],
	K extends string
>(flags: O, cli: any) {
	const optionsToPrompt = flags
		.filter((flag) => flag.prompt && !cli.flags[flag.key] && !flag.configValue)
		.map((flag) => ({
			key: flag.key,
			name: flag.description,
			value: cli.flags[flag.key] as string,
			configValue: flag.configValue,
		}));
	const prompted = await optionPrompt(optionsToPrompt);

	const getOptionValue = (key: K) => {
		const promptedValue = prompted.find((o) => o.key === key)?.value;
		const configValue = flags.find((o) => o.key === key)?.configValue;
		return promptedValue || cli.flags[key] || configValue;
	};

	return {
		getOptionValue,
	};
}
