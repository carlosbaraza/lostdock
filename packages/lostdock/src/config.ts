import os from "os";
import path from "path";
import { cosmiconfigSync } from "cosmiconfig";
import _ from "lodash";
import z from "zod";
import child_process from "child_process";
import fs from "fs";

const explorerSync = cosmiconfigSync("lostdock");
const searchedFor = explorerSync.search();

const UNVALIDATED_COMMANDS = ["login", "logout"];

const foo = <T>(x: T): T => x;
foo(42);

function getValue<T, V extends boolean, S = T>(config: {
  env: string;
  rcPath: string;
  defaultValue?: T | undefined | null;
  schema: z.ZodType<S>;
  transform: (value: S) => T;
  validate: V;
}): V extends true ? T : T | undefined {
  const rcValue = _.get(searchedFor?.config, config.rcPath);
  const envValue = process.env[config.env];
  const value = envValue ?? rcValue ?? config.defaultValue;
  const transform = config.transform ?? ((value: S) => value as unknown as T);
  if (!config.validate) {
    return transform(value);
  }
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
  return transform(parsedValue);
}

// make sure ~/.lostdock/logins.json exists, if not create it
child_process.execSync(`mkdir -p ${os.homedir()}/.lostdock`);
child_process.execSync(`touch ${os.homedir()}/.lostdock/logins.json`);
const loginsPath = path.join(os.homedir(), ".lostdock", "logins.json");
const logins = fs.readFileSync(loginsPath, "utf8") || "[]";
const parsedLogins = JSON.parse(logins);
const login = parsedLogins[0];

export const config = <V extends boolean = true>(options: { validate?: V } = {}) => {
  const validate = options?.validate ?? true;

  const ssh = {
    host: getValue({
      env: "LOSTDOCK_SSH_HOST",
      rcPath: "ssh.host",
      defaultValue: login?.ssh?.host as string | undefined,
      schema: z.string().min(1),
      transform: (v) => v,
      validate,
    }),
    user: getValue({
      env: "LOSTDOCK_SSH_USER",
      rcPath: "ssh.user",
      defaultValue: login?.ssh?.user as string | undefined,
      schema: z.string().min(1),
      transform: (v) => v,
      validate,
    }),
    privateKeyPath: getValue({
      env: "LOSTDOCK_SSH_PRIVATE_KEY_PATH",
      rcPath: "ssh.privateKeyPath",
      defaultValue: login?.ssh?.privateKeyPath as string | undefined,
      schema: z.string().min(1),
      transform: (v) => v,
      validate,
    }),
  };

  const homePath = ssh.user === "root" ? "/root" : `/home/${ssh.user}`;

  return {
    ssh,
    server: {
      homePath,
      stacksPath: getValue({
        env: "LOSTDOCK_SERVER_STACKS_PATH",
        rcPath: "server.stacksPath",
        defaultValue: path.join(homePath, "stacks"),
        schema: z.string().min(1),
        transform: (v) => v,
        validate,
      }),
    },
    verbose: getValue({
      env: "VERBOSE",
      rcPath: "verbose",
      defaultValue: false,
      schema: z.boolean().or(z.string().regex(/^(true|false|1|0)$/)),
      transform: (v) => {
        if (typeof v === "boolean") return v;
        return v === "true" || v === "1";
      },
      validate,
    }),
    stack: {
      name: getValue({
        env: "LOSTDOCK_STACK_NAME",
        rcPath: "stack.name",
        schema: z.string().min(1).optional(),
        transform: (v) => v,
        validate,
      }),
    },
    loginsPath,
    moduleRoot: path.resolve(__dirname, ".."),
  };
};
