import fs from "fs";
import os from "os";
import path from "path";
import z from "zod";

const loginSchema = z.object({
  default: z.boolean(),
  ssh: z.object({
    host: z.string(),
    user: z.string(),
    privateKeyPath: z.string(),
  }),
  global: z.object({
    stacks: z.object({
      path: z.string(),
    }),
  }),
});
const loginsSchema = z.array(loginSchema);

function ensureLoginFileExists() {
  const loginFolder = path.join(os.homedir(), ".lostdock");
  if (!fs.existsSync(loginFolder)) {
    fs.mkdirSync(loginFolder);
  }
  const loginsFile = path.join(loginFolder, "logins.json");
  if (!fs.existsSync(loginsFile)) {
    fs.writeFileSync(loginsFile, "[]");
  }
}

function ensureLoginFolderExists(login: z.TypeOf<typeof loginSchema>) {
  // make sure the .lostdock/host folder exists
  const loginFolder = path.join(os.homedir(), ".lostdock", login.ssh.host);
  if (!fs.existsSync(loginFolder)) {
    fs.mkdirSync(loginFolder);
  }
  // make sure to create the .lostdock/{host}/stacks folder
  const stacksFolder = path.join(loginFolder, "stacks");
  if (!fs.existsSync(stacksFolder)) {
    fs.mkdirSync(stacksFolder);
  }
}

export function getLogins() {
  ensureLoginFileExists();
  const loginsPath = path.join(os.homedir(), ".lostdock", "logins.json");
  const loginsRaw = fs.readFileSync(loginsPath, "utf8") || "[]";
  const loginsJson = JSON.parse(loginsRaw);

  const logins = loginsSchema.parse(loginsJson);
  logins.forEach(ensureLoginFolderExists);

  const defaultLogin = logins.find((login) => login.default) || logins[0];

  return {
    logins: logins,
    defaultLogin,
    loginsPath,
  };
}

export function addLogin(
  loginWithoutDefault: Omit<z.TypeOf<typeof loginSchema>, "default" | "global">
) {
  const { logins, loginsPath } = getLogins();

  const login = {
    ...loginWithoutDefault,
    default: true,
    global: {
      stacks: {
        path: path.join(os.homedir(), ".lostdock", loginWithoutDefault.ssh.host, "stacks"),
      },
    },
  };

  const existingLogin = logins.find((l) => l.ssh.host === login.ssh.host);
  if (existingLogin) {
    throw new Error(`Login for host ${login.ssh.host} already exists`);
  }

  const setDefaultFalse = (l: z.TypeOf<typeof loginSchema>) => ({
    ...l,
    default: false,
  });
  const newLogins = [...logins.map(setDefaultFalse), login];
  fs.writeFileSync(loginsPath, JSON.stringify(newLogins, null, 2));

  ensureLoginFolderExists(login);
}

export function makeLoginDefault(host: string) {
  const { logins, loginsPath } = getLogins();
  const login = logins.find((l) => l.ssh.host === host);
  if (!login) {
    throw new Error(`Login for host "${host}" does not exist`);
  }
  const newLogins = logins.map((l) => ({
    ...l,
    default: l.ssh.host === host,
  }));
  fs.writeFileSync(loginsPath, JSON.stringify(newLogins, null, 2));
}
