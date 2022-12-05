import chalk from "chalk";
import { config } from "../../lib/config/config";
import { AsyncScript } from "../../lib/RunAsyncScript";
import { enableRemoteRsaKey, exec, getSshClient } from "../../lib/ssh/ssh";
import command from "./index";

export const init: AsyncScript<typeof command.definition.options> = async ({
  setStatus,
  log,
  getOptionValue,
  setLoading,
}) => {
  setStatus("Enabling RSA SSH Keys in remote server");
  await enableRemoteRsaKey({
    privateKeyPath: config().ssh.privateKeyPath,
    user: config().ssh.user,
    host: config().ssh.host,
  });

  setStatus("Preparing SSH client");
  const ssh = await getSshClient();

  setStatus(`Creating the stacks directory: ${config().server.stacksPath}`);
  await exec(ssh, `mkdir -p ${config().server.stacksPath}`);

  setStatus("Updating and installing dependencies");
  await exec(
    ssh,
    `
sudo -E apt-get update
sudo -E apt-get --only-upgrade install grub-efi-amd64-signed -y # otherwise it fails in hetzner
sudo -E apt-get upgrade -y
sudo -E apt-get install -y \
	ca-certificates \
	curl \
	gnupg \
	lsb-release \
`,
    { log }
  );

  setStatus("Installing Docker");
  await exec(
    ssh,
    `
sudo mkdir -p /etc/apt/keyrings;
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo -E gpg --yes --dearmor -o /etc/apt/keyrings/docker.gpg;
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | sudo -E tee /etc/apt/sources.list.d/docker.list >/dev/null;
sudo -E apt-get update;
sudo -E apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin;
`,
    { log }
  );

  setStatus("Starting the Firewall. Allow only 443, 80, 22");
  await exec(
    ssh,
    `
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
yes | sudo ufw enable
`,
    { log }
  );

  setLoading(false);
  setStatus(chalk.green("Done"));
  setTimeout(() => {
    process.exit(0);
  }, 500);
};
