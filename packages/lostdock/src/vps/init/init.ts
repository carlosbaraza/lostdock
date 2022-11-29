import md5 from "apache-md5";
import chalk from "chalk";
import path from "path";
import { config } from "../../config";
import { enableRemoteRsaKey, exec, getSshClient } from "../../utils/ssh/ssh";
import { AsyncScript } from "../../utils/RunAsyncScript";
import command from "./index";
import { Writable, Readable, Transform } from "stream";
import readline from "readline";

export const init: AsyncScript<typeof command.definition.options> = async ({
  setStatus,
  log,
  getOptionValue,
  setLoading,
}) => {
  setStatus("Enabling RSA SSH Keys in remote server");
  await enableRemoteRsaKey();

  setStatus("Preparing SSH client");
  const ssh = await getSshClient();

  setStatus("Pulling previously generated Let's Encrypt ACME certificates");
  try {
    await ssh.getFile(
      path.join(config.moduleRoot, "core-services/traefik/letsencrypt/acme.json"),
      path.join(config.server.coreServicesPath, "traefik/letsencrypt/acme.json")
    );
  } catch (error: any) {
    if (!error.message.includes("No such file")) throw error;
  }

  // setStatus("Uploading core services");
  // await ssh.putDirectory(
  //   path.join(config.moduleRoot, "core-services"),
  //   config.server.coreServicesPath
  // );
  // await exec(ssh, `mkdir -p ${config.server.stacksPath}`);

  setStatus("Updating and installing dependencies");

  await exec(
    ssh,
    `
sudo apt-get update
sudo apt-get --only-upgrade install grub-efi-amd64-signed -y # otherwise it fails in hetzner
sudo apt-get upgrade -y
sudo apt-get install -y \
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
export DEBIAN_FRONTEND=noninteractive
sudo mkdir -p /etc/apt/keyrings;
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --yes --dearmor -o /etc/apt/keyrings/docker.gpg;
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null;
sudo apt-get update;
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin;
`,
    { log }
  );

  setStatus("Installing Docker Loki Driver");
  await exec(
    ssh,
    `
docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions
sudo mkdir -p /etc/docker/plugins
sudo touch /etc/docker/daemon.json
sudo tee /etc/docker/daemon.json <<EOF
{
	"log-driver": "loki",
	"log-opts": {
		"loki-url": "http://localhost:3100/loki/api/v1/push",
		"loki-retries": "5",
		"loki-batch-size": "400",
		"loki-batch-wait": "1s",
		"loki-external-labels": "hostname=$(hostname)"
	}
}
EOF
sudo systemctl restart docker
`,
    { log }
  );

  setStatus("Starting Traefik");
  const traefikUser = getOptionValue("traefikUser");
  const traefikHash = md5((getOptionValue("traefikPassword") as string) || "")
    .split("$")
    .join("$$");
  await exec(
    ssh,
    `
docker network create proxy || true
rm .env
echo 'TRAEFIK_HOST=${getOptionValue("traefikHost")}' | tee -a .env
echo 'TRAEFIK_BASIC_AUTH="${traefikUser}:${traefikHash}"' | tee -a .env
echo 'LETSENCRYPT_EMAIL="${getOptionValue("letsencryptEmail")}"' | tee -a .env
source .env
# substitute env vars in config/traefik.template.yml
eval "cat <<EOF
$(<config/traefik.template.yml)
EOF
" > config/traefik.yml
touch letsencrypt/acme.json
chmod 600 letsencrypt/acme.json
docker compose up -d --force-recreate
`,
    {
      cwd: config.server.coreServicesPath + "/traefik",
      log,
    }
  );

  setStatus(
    "Starting Grafana, Loki, Promtail, Prometheus, Alertmanager, Node Exporter, cAdvisor, Netdata"
  );
  const netdataUser = getOptionValue("netdataUser");
  const netdataHash = md5((getOptionValue("netdataPassword") as string) || "")
    .split("$")
    .join("$$");
  await exec(
    ssh,
    `
sudo chown -R 472:472 grafana/data
sudo chown -R 1000:1000 prometheus/data
sudo chown -R 10001:10001 loki/data
sudo chown -R 201:201 netdata/data
sudo chown -R 201:201 netdata/lib
sudo chown -R 201:201 netdata/cache
rm .env
echo 'GRAFANA_HOST=${getOptionValue("grafanaHost")}' | tee -a .env
echo 'NETDATA_HOST=${getOptionValue("netdataHost")}' | tee -a .env
echo 'NETDATA_BASIC_AUTH="${netdataUser}:${netdataHash}"' | tee -a .env
docker compose up -d --force-recreate
`,
    {
      cwd: config.server.coreServicesPath + "/monitoring",
      log,
    }
  );

  setStatus("Starting Portainer");
  await exec(
    ssh,
    `
chown -R 10001:10001 data
rm .env
echo 'PORTAINER_HOST=${getOptionValue("portainerHost")}' | tee -a .env
docker compose up -d --force-recreate
`,
    {
      cwd: config.server.coreServicesPath + "/portainer",
      log,
    }
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
  process.exit(0);
};
