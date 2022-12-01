import chalk from "chalk";
import meow from "meow";
import { AnyFlag } from "meow";

type Subcommand =
  | {
      name: string;
      description: string;
      run: () => void;
    }
  | {
      definition: {
        name: string;
        description: string;
      };
      run: () => void;
    };

const renderSubcommands = (commands: Subcommand[]) => {
  if (!commands.length) return "";
  let output = "Commands:\n";

  const terminalWidth = process.stdout.columns || 50;

  commands.forEach((command) => {
    const name = "name" in command ? command.name : command.definition.name;
    const description =
      "description" in command ? command.description : command.definition.description;

    const paddedName = `  ${`${name} `.padEnd(20, "·")} `;
    const wrappedDescription = description
      .split(" ")
      .reduce((lines, word) => {
        const rightMargin = 4;
        const lastLine = lines[lines.length - 1];
        if (
          lastLine &&
          lastLine.length + word.length + rightMargin + paddedName.length < terminalWidth
        ) {
          lines[lines.length - 1] += ` ${word}`;
        } else {
          lines.push(word);
        }
        return lines;
      }, [] as string[])
      .join(`\n${" ".repeat(paddedName.length)}`);

    output += `${paddedName}${wrappedDescription}\n`;
  });
  return output;
};

export type Option<K extends string> = AnyFlag & {
  key: K;
  description: string;
  prompt?: boolean;
  configValue?: () => any;
};

const renderOptions = (options: Option<string>[]) => {
  if (!options.length) return "";
  let output = "Options:\n";
  options.forEach((option) => {
    const alias = option.alias ? `-${option.alias}` : "";
    const flag = `--${option.key}${alias?.length ? `, ${alias}` : ""}`;
    output += `  ${`${flag} `.padEnd(20, "·")} ${option.description}\n`;
  });
  return output;
};

type GetFlagsFromOptions<T> = T extends Option<infer K>[] ? Record<K, AnyFlag> : never;

const getFlagsFromOptions = <K extends string>(options: Option<K>[]) => {
  const flags: GetFlagsFromOptions<typeof options> = {} as any;
  options.forEach((option) => {
    flags[option.key] = option;
  });
  return flags;
};

export type CommandDefinition<OptionKeys extends string, Options extends Option<OptionKeys>[]> = {
  header?: string;
  name: string;
  usage: string;
  description: string;
  subcommands: Subcommand[];
  options: Options;
  footer?: string;
  run?: (
    cli: meow.Result<GetFlagsFromOptions<Options>>,
    command: CommandDefinition<OptionKeys, Options>
  ) => Promise<void>;
  commandDepth: number;
};

export function command<OptionKeys extends string, Options extends Option<OptionKeys>[]>(
  definition: CommandDefinition<OptionKeys, Options>
) {
  const run = async () => {
    const cli = meow(
      `${definition.header || ""}

${chalk.yellow(`Usage
  $ ${definition.usage}`)}

${chalk.bold(definition.description)}

${renderSubcommands(definition.subcommands)}
${renderOptions(definition.options)}
${definition.footer || ""}
`,
      {
        flags: getFlagsFromOptions(definition.options),
      }
    );

    const subcommandName = cli.input[definition.commandDepth || 0];
    const subcommand = definition.subcommands.find(
      (c) => ("name" in c ? c.name : c.definition.name) === subcommandName
    );
    if (subcommand) {
      return subcommand.run();
    }

    if (cli.flags["help"]) {
      return cli.showHelp();
    }

    if (definition.run) {
      return definition.run(cli as any, definition);
    }

    return cli.showHelp();
  };

  return {
    run,
    definition,
  };
}
