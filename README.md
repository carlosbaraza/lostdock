[![lostdock github social banner](./apps/docs/public/lostdock-banner/lostdock-banner-1280x640.png)](https://lostdock.com)

# lostdock

![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/carlosbaraza/lostdock/Release/main)
![GitHub](https://img.shields.io/github/license/carlosbaraza/lostdock)
![npm](https://img.shields.io/npm/v/lostdock)

`lostdock` is a simple command line tool that allows managing a server running multiple `docker compose` stacks. Cheap (money and time) deployment solution for the underserved small startup.

- Replace expensive PaaS/SaaS tools with pre-configured open source stacks for [log and metric aggregation](./packages/lostdock-monitoring), [reverse proxy](./packages/lostdock-traefik), [container management](./packages/lostdock-portainer), and more.

## Installation

```bash
# In your local environment
npm install -g lostdock
```

## Getting started

Prerequisites:

- A VPS with your SSH key allowed to login as root. We recommend creating a new VPS first with a cheap provider that gives you a static IPv4 address.

Install CLI in your local environment:

```bash
npm install -g lostdock
```

Configure lostdock with your SSH connection details:

```bash
lostdock login
```

Install Docker, Docker compose, some dependencies and start the firewall.

```bash
lostdock server init
```

Run the traefik reverse proxy. You need a wildcard A record `*.example.com` pointing to your server IPv4 address.

```bash
export TRAEFIK_HOST=traefik.example.com

# Basic auth: admin:admin
# Generated with `echo $(htpasswd -nb admin admin) | sed -e s/\\$/\\$\\$/g`
# Double dollar signs are required in Docker Compose
export TRAEFIK_BASIC_AUTH='admin:$$apr1$$QWfIwdTB$$tTTke28GgXk790t3agoKm.'

export LETSENCRYPT_EMAIL=example@example.com

lostdock stacks install-from-git \
    --url https://github.com/carlosbaraza/lostdock.git \
    --path ./packages/lostdock-traefik
```

After these, you should be able to access your Traefik Dashboard at `traefik.example.com`. (user: `admin`, password: `admin`)

You can deploy many other pre-configured stacks using the same commands. We recommend you install the following stacks too: [lostdock-monitoring (log and metric aggregation and visualization stack)](./packages/lostdock-monitoring) and [lostdock-portainer (container management)](./packages/lostdock-portainer)

### Deploying your first stack

Create a new folder for your stack and `cd` into it:

```bash
mkdir whoami-stack
cd whoami-stack
```

Create a `docker-compose.yml` with a simple `traefik/whoami` service responding to the domain `whoami.example.com`. TLS certificates would be generated automatically for it using Let's Encrypt.

```yml
version: "3.7"
services:
  whoami:
    image: "traefik/whoami"
    container_name: "whoami"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whoami.rule=Host(`whoami.example.com`)"
      - "traefik.http.routers.whoami.service=whoami"
      - "traefik.http.routers.whoami.entrypoints=websecure"
      - "traefik.http.routers.whoami.tls=true"
      - "traefik.http.routers.whoami.tls.certresolver=letsencrypt"
      - "traefik.http.services.whoami.loadbalancer.server.port=9000"
```

Optionally, you can include the following:

- A `.env` file with the environment variables to use in your `docker-compose.yml` file.
- A `./install-local.sh` file executed before installing to validate configuration
- A `./install-server.sh` file executed in the server before running `docker compose up` for the first time. This is a good opportunity to create some volumes, external docker networks, file structures, permissions, etc.

When you are ready, run `lostdock stacks install`, and `lostdock` will do the following:

- Run `./install-local.sh` (validate configuration)
- Push stack configuration files to server
- Run `./install-server.sh` (preparation before starting stack. E.g. change permissions, create volumes, networks, etc)
- Run `docker compose up`.

Finally, clarify that you can easily stop using `lostdock`. You can always SSH into your server and keep using `docker compose` bare bones.

## Features

`lostdock` gives you a nice set of tools to make deploying `docker compose` stacks to a VPS easier. Some of the features are:

- `lostdock server init`: Install Docker and Docker Compose on a fresh VPS server
- `lostdock stacks install`: Deploy a stack to a server
- `lostdock stacks install-from-git`: Deploy stack from a GitHub repository including a `docker-compose.yml`. Useful to share pre-configured stacks.
- `lostdock stacks`: Manage stack configuration, environment variables, start, stop, restart, etc.
- Multiple extremely useful stacks:
  - [lostdock-traefik](https://github.com/carlosbaraza/lostdock/tree/main/packages/lostdock-traefik): Reverse proxy with auto generated TLS certificates
  - [lostdock-monitoring](https://github.com/carlosbaraza/lostdock/tree/main/packages/lostdock-monitoring): Log and metric aggregation and visualization stack. Grafana, Loki, Prometheus, cAdvisor, Node Exporter, alertmanager, and more.
  - [lostdock-portainer](https://github.com/carlosbaraza/lostdock/tree/main/packages/lostdock-portainer): Container management. Web UI to manage your Docker environments, stacks & containers with ease.

Refer to the [full documentation at lostdock.com](https://lostdock.com) for an exhaustive list of features.

## FAQs

### How could I stop using lostdock?

`lostdock` is a thin wrapper around `docker compose` with some handy tools to init a server, set env variables, install pre-configured stacks, etc. However, the core is just `docker compose` and a few bash scripts in your stack folder, so it is very easy to stop using if ever needed. Just SSH into your server and run `docker compose` in the `~/stacks/your-stack` folder.

### Why old school VPS and `docker compose`?

The key insight is that **Virtual Private Servers are cheap, but your time is not**. If only we could easily setup/maintain a server and deploy many apps in it.

Some unordered thoughts that brought me to this solution:

- A cheap $5/month server can handle an incredible amount of load. If needed it could scale vertically, although most projects would never see that much traffic.
- A lot have changed since VPS run out of popularity.
  - We exhausted ourselves with messy admin heavy deployments (manual dependency management, conflicting dependencies, manual migrations, manual DB admin, manual process management, etc).
  - Docker changed it for good, with nice packages that contain all that is needed to run your application without conflicts. Now your problem is orchestrating Docker containers (solved by `docker compose` among many others).
- Distributing pre-configured stacks becomes trivial if you set a flexible enough standard (e.g. Kubernetes Helm). We can replace many expensive SaaS tools like Datadog. For example [lostdock-monitoring (log and metric aggregation and visualization stack)](./packages/lostdock-monitoring), [lostdock-traefik (reverse proxy)](./packages/lostdock-traefik) and [lostdock-portainer (container management)](./packages/lostdock-portainer).
- PaaS like Vercel, Fly, Heroku are useful, but not a general target for any kind of application. Hooking multiple microservices, databases, etc is hard and bug prone (compared to a simple `docker-compose.yml`).
- Kubernetes and other orchestration software are complex, and the benefits are only apparent in big organizations with large teams and projects. Small startups are underserved.
- Docker is the de-facto standard for containers nowadays.
  - The tooling is really mature and stable after some buggy beginnings that created myths about how reliable containers are.
  - It is quite simple to package any type of application into a docker image. You can even run databases.

## License

MIT
