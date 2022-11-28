import os from "os";
import path from "path";
import { cosmiconfigSync } from "cosmiconfig";
import _ from "lodash";
import z from "zod";

const explorerSync = cosmiconfigSync("lostdock");
const searchedFor = explorerSync.search();

function getValue<T, S = T>(config: {
  env: string;
  rcPath: string;
  defaultValue?: T;
  schema: z.ZodType<S>;
  transform: (value: S) => T;
}): T {
  const rcValue = _.get(searchedFor?.config, config.rcPath);
  const envValue = process.env[config.env];
  const value = envValue ?? rcValue ?? config.defaultValue;
  let parsedValue: S;
  try {
    parsedValue = config.schema.parse(value);
  } catch (error: any) {
    if ("message" in error) console.error(error.message);
    console.error(
      `Invalid value "${value}" in .lostdockrc (${config.rcPath}) or env variable "${config.env}"`
    );
    process.exit(1);
  }
  const transform = config.transform ?? ((value: S) => value as unknown as T);
  return transform(parsedValue);
}

const ssh = {
  host: getValue<string>({
    env: "LOSTDOCK_SSH_HOST",
    rcPath: "ssh.host",
    defaultValue: undefined,
    schema: z.string().min(1),
    transform: (v) => v,
  }),
  username: getValue<string>({
    env: "LOSTDOCK_SSH_USERNAME",
    rcPath: "ssh.username",
    defaultValue: "root",
    schema: z.string().min(1),
    transform: (v) => v,
  }),
  privateKeyPath: getValue<string>({
    env: "LOSTDOCK_SSH_PRIVATE_KEY_PATH",
    rcPath: "ssh.privateKeyPath",
    defaultValue: path.join(os.homedir(), "/.ssh/id_rsa"),
    schema: z.string().min(1),
    transform: (v) => v,
  }),
};

const homePath = ssh.username === "root" ? "/root" : `/home/${ssh.username}`;

export const config = {
  ssh,
  server: {
    homePath,
    coreServicesPath: getValue<string>({
      env: "LOSTDOCK_SERVER_CORE_SERVICES_PATH",
      rcPath: "server.coreSericesPath",
      defaultValue: path.join(homePath, "core-services"),
      schema: z.string().min(1),
      transform: (v) => v,
    }),
    stacksPath: getValue<string>({
      env: "LOSTDOCK_SERVER_STACKS_PATH",
      rcPath: "server.stacksPath",
      defaultValue: path.join(homePath, "stacks"),
      schema: z.string().min(1),
      transform: (v) => v,
    }),
  },
  verbose: getValue<boolean, string | boolean>({
    env: "VERBOSE",
    rcPath: "verbose",
    defaultValue: false,
    schema: z.boolean().or(z.string().regex(/^(true|false|1|0)$/)),
    transform: (v) => {
      if (typeof v === "boolean") return v;
      return v === "true" || v === "1";
    },
  }),
  stack: {
    name: getValue<string | undefined>({
      env: "LOSTDOCK_STACK_NAME",
      rcPath: "stack.name",
      schema: z.string().min(1).optional(),
      transform: (v) => v,
    }),
  },
  moduleRoot: path.resolve(__dirname, ".."),
};
