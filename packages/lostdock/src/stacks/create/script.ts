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
  const srcPath = path.join(stackPath, "src");
  if (!fs.existsSync(srcPath)) {
    setStatus(`Creating ${srcPath} directory`);
    fs.mkdirSync(srcPath, { recursive: true });
  }
  const srcIndexPath = path.join(srcPath, "index.html");
  if (fs.existsSync(envPath)) {
    setStatus(`src/index.html already exists. Path: ${srcIndexPath}. Aborting.`);
    return setTimeout(() => {
      process.exit(1);
    }, 500);
  }

  setStatus("Creating .lostdockrc.json");
  fs.writeFileSync(stackConfigPath, JSON.stringify({ stack: { name: stackName } }, null, 2));

  setStatus("Creating docker-compose.yml");
  fs.writeFileSync(
    dockerComposePath,
    `version: "3.9"

networks:
  # Network where traefik reverse proxy is running
  proxy:
    external: true

services:
  # Simple web service. It uses lostdock-traefik for the dynamic reverse proxy with automated TLS          certificates.
  ${stackName}:
    image: "nginx"
    volumes:
      - ./src:/usr/share/nginx/html
      
    # Expose the environment variables to your service
    env_file:
      - ./.env
    
    # Always restart the container if it fails
    restart: always
    # We can change the amount of containers running at the same time
    deploy:
      mode: replicated
      replicas: 1
      endpoint_mode: vip
    
    # We need to add the service to the traefik network
    networks:
      - proxy
    
    # Traefik configuration is fetched dynamically from the labels of other running containers
    labels:
      - traefik.enable=true
      # Don't forget to add an A record pointing to the server IP address to your DNS.
      - traefik.http.routers.${stackName}.rule=Host(\`\${HOST}\`)
      - traefik.http.routers.${stackName}.service=${stackName}
      - traefik.http.routers.${stackName}.entrypoints=websecure
      - traefik.http.routers.${stackName}.tls=true
      - traefik.http.routers.${stackName}.tls.certresolver=letsencrypt
      - traefik.http.services.${stackName}.loadbalancer.server.port=80
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
# You can use the environment variables in your docker-compose.yml file.

# The domain name for the stack. Used in the docker-compose.yml service traefik configuration.
HOST="${stackName}.example.com"
`
  );

  setStatus("Creating .env.example");
  fs.writeFileSync(
    envExamplePath,
    `# This file is used to store environment variables for the stack.
# You can use the environment variables in your docker-compose.yml file.

# The domain name for the stack. Used in the docker-compose.yml service traefik configuration.
HOST="${stackName}.example.com"
`
  );

  setStatus("Creating src/index.html");
  fs.writeFileSync(
    srcIndexPath,
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LostDock Example</title>
    <style>
      /** Reset */
      html {
        box-sizing: border-box;
        font-size: 16px;
      }

      *,
      *:before,
      *:after {
        box-sizing: inherit;
      }

      body,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      p,
      ol,
      ul {
        margin: 0;
        padding: 0;
        font-weight: normal;
      }

      ol,
      ul {
        list-style: none;
      }

      img {
        max-width: 100%;
        height: auto;
      }

      /** Custom */
      body {
        width: 100vw;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: sans-serif;
        background-color: #f5f5f5;
        text-align: center;
        line-height: 1.5;
        padding: 20px;
      }

      h1 {
        font-weight: bold;
      }

      .inline-code {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        background-color: #ccc;
        border-radius: 0.5rem;
        font-family: monospace;
      }

      .content {
        max-width: 600px;
        background: #eaeaea;
        padding: 40px;
        border-radius: 40px;
      }

      .content > * + * {
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="content">
      <h1>LostDock Example</h1>
      <p>
        Welcome to your first example <a href="https://lostdock.com">lostdock</a> stack. You can
        change the <span class="inline-code">src/index.html</span> file to customize this page.
      </p>
      <p>
        You can change the <span class="inline-code">docker-compose.yml</span> stack configuration
        to deploy your own Docker image.
      </p>
      <p>
        Please, check out our
        <a href="https://lostdock.com">documentation</a> and our
        <a href="https://github.com/carlosbaraza/lostdock">lostdock GitHub repository</a> for any
        questions you might have. We are building a strong community to support you.
      </p>
    </div>
  </body>
</html>`
  );

  setTimeout(() => {
    console.log(
      chalk.green(`
Stack configuration files created.

To deploy the stack. Review the environment variables in the .env file and run:
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
