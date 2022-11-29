#!/usr/bin/env node

import { render } from "ink";
import { command } from "../../utils/command/command";
import { promptMissingOptions } from "../../utils/prompt-missing-options";
import { RunAsyncScript } from "../../utils/RunAsyncScript";
import { init } from "./init";

export default command({
  name: "init",
  usage: "lostdock server init",
  description: "Initialize a server. Install dependencies, Docker, Traefik, enable firewall.",
  subcommands: [],
  options: [
    {
      key: "grafanaHost",
      type: "string",
      isRequired: false,
      description: "Grafana Dashboard Hostname (e.g. grafana.example.com)",
      prompt: true,
    },
    {
      key: "netdataHost",
      type: "string",
      isRequired: false,
      description: "Netdata Dashboard Hostname (e.g. netdata.example.com)",
      prompt: true,
    },
    {
      key: "netdataUser",
      type: "string",
      isRequired: false,
      description: "Netdata Dashboard Basic Auth Username",
      prompt: true,
    },
    {
      key: "netdataPassword",
      type: "string",
      isRequired: false,
      description: "Netdata Dashboard Basic Auth Password",
      prompt: true,
    },
    {
      key: "portainerHost",
      type: "string",
      isRequired: false,
      description: "Portainer Dashboard Hostname (e.g. portainer.example.com)",
      prompt: true,
    },
    {
      key: "traefikHost",
      type: "string",
      isRequired: false,
      description: "Traefik Dashboard Hostname (e.g. traefik.example.com)",
      prompt: true,
    },
    {
      key: "letsencryptEmail",
      type: "string",
      isRequired: false,
      description: "Let's Encrypt Email Address for TLS Certificates",
      prompt: true,
    },
    {
      key: "traefikUser",
      type: "string",
      isRequired: false,
      description: "Traefik Dashboard Basic Auth Username",
      prompt: true,
    },
    {
      key: "traefikPassword",
      type: "string",
      isRequired: false,
      description: "Traefik Dashboard Basic Auth Password",
      prompt: true,
    },
    {
      key: "help",
      alias: "h",
      description: "Show help",
      type: "boolean",
    },
  ],
  commandDepth: 2,
  run: async (cli, command) => {
    const { getOptionValue } = await promptMissingOptions(command.options, cli);

    render(<RunAsyncScript script={init} getOptionValue={getOptionValue} />);
  },
});
