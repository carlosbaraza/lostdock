import Spinner from "ink-spinner";
import React from "react";
import { useEffect, useState } from "react";
import { config } from "../config";
import { GetOptionValue } from "./prompt-missing-options";
import { Box, Text } from "ink";
import { getSshClient } from "../utils/ssh/ssh";
import { NodeSSH } from "node-ssh";
import chalk from "chalk";
import { Option } from "./command/command";
import { isNull } from "lodash";

export type AsyncScript<
  O extends Option<OptionKey>[],
  OptionKey extends string = O[number]["key"],
  C = AsyncScriptConfig<O, OptionKey>
> = (config: C) => void;

export type AsyncScriptConfig<O extends Option<OptionKey>[], OptionKey extends string> = {
  setStatus: (status: string) => void;
  log: (logs: string | null) => void;
  getOptionValue: GetOptionValue<O, any>;
  setLoading: (loading: boolean) => void;
};

type AsyncScriptWithSSH<O extends Option<OptionKey>[], OptionKey extends string> = AsyncScript<
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

export function RunAsyncScript<O extends Option<OptionKey>[], OptionKey extends string>(props: {
  getOptionValue: GetOptionValue<O, OptionKey>;
  script: AsyncScript<O, OptionKey>;
}) {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Starting");
  const [logs, setLogs] = useState<string[]>([]);

  const setStatus = async (status: string) => {
    return new Promise<void>((resolve) => {
      setMessage((prevMessage) => {
        if (prevMessage !== "Starting") {
          console.log("✔ " + prevMessage);
        }
        return status;
      });
      setTimeout(resolve, 100);
    });
  };

  function log(logLine: string | null) {
    if (logLine) {
      const cleanLine = logLine
        .trim()
        // Remove delete line characters
        .replace(/[\x1b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");

      if (cleanLine) {
        setLogs((prevLogs) => [...prevLogs.slice(-9), cleanLine]);
      }
    } else if (isNull(logLine)) {
      setLogs([]);
    }
  }

  useEffect(() => {
    async function runScript() {
      await props.script({
        setLoading,
        setStatus,
        log,
        getOptionValue: props.getOptionValue,
      });

      setLoading(false);
      setStatus(chalk.green("Done"));
      process.exit(0);
    }
    runScript();
  }, []);

  return (
    <Box flexDirection="column">
      <Text color="yellow">
        {loading && !config({ validate: false }).verbose ? (
          <>
            <Spinner type="dots" />{" "}
          </>
        ) : null}
        {message}
      </Text>

      {logs.length ? (
        <Box
          minHeight={logs.length}
          flexDirection="column"
          borderStyle="classic"
          borderColor="gray"
        >
          {!config({ validate: false }).verbose && logs.length
            ? logs.map((logLine, i) => (
                <Text color="gray" wrap="wrap" key={`${logLine}-${i}`}>
                  {logLine}
                </Text>
              ))
            : null}
        </Box>
      ) : null}
    </Box>
  );
}
