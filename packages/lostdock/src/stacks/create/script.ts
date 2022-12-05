import chalk from "chalk";
import fs from "fs";
import path from "path";
import { config } from "../../lib/config/config";
import { AsyncScript } from "../../lib/RunAsyncScript";
import command from "./index";

export const script: AsyncScript<typeof command.definition.options> = async ({
  setStatus,
  log,
  getOptionValue,
  setLoading,
}) => {
  const stackName = getOptionValue("name");

  let stackPath = getOptionValue("path");
  if (!stackPath) {
    stackPath = path.join(process.cwd(), stackName);
    setStatus(`Creating ${stackPath} directory`);
    fs.mkdirSync(stackPath, { recursive: true });
  }
  if (!fs.lstatSync(stackPath).isDirectory()) {
    setStatus(`Path is not a directory. Path: ${stackPath}. Aborting.`);
    return setTimeout(() => {
      process.exit(1);
    }, 500);
  }

  const stackConfigPath = path.join(stackPath, ".lostdockrc.json");
  if (fs.existsSync(stackConfigPath)) {
    setStatus(`.lostdockrc.json already exists. Path: ${stackConfigPath}. Aborting.`);
    return setTimeout(() => {
      process.exit(1);
    }, 500);
  }
  const dockerComposePath = path.join(stackPath, "docker-compose.yml");
  if (fs.existsSync(dockerComposePath)) {
    setStatus(`docker-compose.yml already exists. Path: ${dockerComposePath}. Aborting.`);
    return setTimeout(() => {
      process.exit(1);
    }, 500);
  }
  const gitIgnorePath = path.join(stackPath, ".gitignore");
  if (fs.existsSync(gitIgnorePath)) {
    setStatus(`.gitignore already exists. Path: ${gitIgnorePath}. Aborting.`);
    return setTimeout(() => {
      process.exit(1);
    }, 500);
  }
  const envPath = path.join(stackPath, ".env");
  if (fs.existsSync(envPath)) {
    setStatus(`.env already exists. Path: ${envPath}. Aborting.`);
    return setTimeout(() => {
      process.exit(1);
    }, 500);
  }
  const envExamplePath = path.join(stackPath, ".env.example");
  if (fs.existsSync(envPath)) {
    setStatus(`.env already exists. Path: ${envPath}. Aborting.`);
    return setTimeout(() => {
      process.exit(1);
    }, 500);
  }

  setStatus("Creating .lostdockrc.json");
  fs.writeFileSync(stackConfigPath, JSON.stringify({ stack: { name: stackName } }, null, 2));

  setStatus("Creating docker-compose.yml");
  fs.writeFileSync(
    dockerComposePath,
    `version: "3.8"
services:
  # Simple web service. It uses lostdock-traefik for the dynamic reverse proxy with automated TLS certificates.
  ${stackName}:
    image: "traefik/whoami"
    labels:
      # Traefik configuration
      - "traefik.enable=true"
      # Don't forget to add an A record pointing to the server IP address to your DNS.
      - "traefik.http.routers.${stackName}.rule=Host(\`${stackName}.example.com\`)"
      - 'traefik.http.routers.${stackName}.service=${stackName}'
      - "traefik.http.routers.${stackName}.entrypoints=websecure"
      - "traefik.http.routers.${stackName}.tls=true"
      - "traefik.http.routers.${stackName}.tls.certresolver=letsencrypt"
      - "traefik.http.services.${stackName}.loadbalancer.server.port=9000"
`
  );

  setStatus("Creating .gitignore");
  fs.writeFileSync(
    gitIgnorePath,
    `node_modules
.env
`
  );

  setStatus("Creating .env");
  fs.writeFileSync(
    envPath,
    `# This file is used to store environment variables for the stack.
# It is not checked into source control.
# You can use the environment variables in your docker-compose.yml file.`
  );

  setStatus("Creating .env.example");
  fs.writeFileSync(
    envExamplePath,
    `# This file is used to store environment variables for the stack.
# You can use the environment variables in your docker-compose.yml file.`
  );

  setTimeout(() => {
    console.log(
      chalk.green(`
Stack configuration files created.
  
To deploy the stack, run:
  cd ${stackPath}
  lostdock stacks push
  lostdock stacks up
  
To remove the stack, run:
  lostdock stacks down
`)
    );
  }, 100);

  setLoading(false);
  setStatus(chalk.green("Success"));
  setTimeout(() => {
    process.exit(0);
  }, 500);
};
