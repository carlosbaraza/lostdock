[![lostdock github social banner](./apps/docs/public/lostdock-banner/lostdock-banner-1280x640.png)](https://lostdock.com)

# lostdock

![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/carlosbaraza/lostdock/Release/main)
![GitHub](https://img.shields.io/github/license/carlosbaraza/lostdock)
![npm](https://img.shields.io/npm/v/lostdock)

`lostdock` is a simple command line tool that allows managing a server running multiple `docker compose` stacks. Cheap (money and time) deployment solution for the underserved small startup.

- `lostdock` is a thin wrapper around `docker compose` with some handy tools to init a server, set env variables, install pre-configured stacks, etc. However, the core is just `docker compose` and a few bash scripts in your stack folder, so it is very easy to stop using if ever needed. Just SSH into your server and run `docker compose` in the `~/stacks/your-stack` folder.
- Bonus: replace expensive PaaS/SaaS tools with pre-configured open source stacks for [log and metric aggregation](./packages/lostdock-monitoring), [reverse proxy](./packages/lostdock-traefik), [container management](./packages/lostdock-portainer), and more.

## Installation

In your local environment:

```bash
npm i -G lostdock
```

## Getting started

Prerequisites:

- A VPS with your SSH key allowed to login as root. We recommend creating a new VPS first with a cheap provider that gives you a static IPv4 address.

Install CLI in your local environment:

```bash
npm i -G lostdock
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

```
mkdir whoami-stack
cd whoami-stack
```

Create `docker-compose.yml` with a simple `traefik/whoami` service responding to the domain `whoami.example.com`. TLS certificates would be generated automatically for it using Let's Encrypt.

```bash
cat <<EOF
version: '3.7'
services:
  whoami:
    image: "traefik/whoami"
    container_name: "example-1"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.example-1.rule=Host(`whoami.example.com`)"
      - 'traefik.http.routers.example-1.service=example-1'
      - "traefik.http.routers.example-1.entrypoints=websecure"
      - "traefik.http.routers.example-1.tls=true"
      - "traefik.http.routers.example-1.tls.certresolver=letsencrypt"
      - "traefik.http.services.example-1.loadbalancer.server.port=9000"
EOF
" > docker-compose.yml
```

Optionally, you can include the following:

- A `.env` file with the environment variables to use in your `docker-compose.yml` file.
- A `./install-local.sh` file executed before installing to validate configuration
- A `./install-server.sh` file executed in the server before running `docker compose up` for the first time. This is a good opportunity to create some volumes, external docker networks, file structures, permissions, etc.

When you are ready, run `lostdock stacks install`, and `lostdock` will do the following:

- Run `./install-local.sh` (validate configuration)
- Push stack
- Run `./install-server.sh` (preparation before starting stack. E.g. change permissions, create volumes, networks, etc)
- Run `docker compose up`.

Finally, clarify that you can easily stop using `lostdock`. You can always SSH into your server and keep using `docker compose` bare bones.

## Why old school VPS and `docker compose`?

The key insight is that **Virtual Private Servers are cheap, but your time is not**. If only we could easily setup/maintain a server and deploy many apps in it... we could iterate fast.

- A cheap $5/month server can handle an incredible amount of load. If needed it could scale vertically, although most projects would never see that much traffic.
- Distributing pre-configured stacks becomes trivial if you set a flexible enough standard. We can replace many expensive SaaS tools like Datadog. For example [lostdock-monitoring (log and metric aggregation and visualization stack)](./packages/lostdock-monitoring), [lostdock-traefik (reverse proxy)](./packages/lostdock-traefik) and [lostdock-portainer (container management)](./packages/lostdock-portainer).
- PaaS like Vercel, Fly, Heroku are useful, but not a general target for any kind of application. Hooking multiple microservices, databases, etc is hard and bug prone (compared to a simple `docker-compose.yml`).
- Kubernetes and other orchestration software are complex, and the benefits are only apparent in big organizations with large teams and projects. Small startups are underserved.
- Docker is the de-facto standard nowadays. The tooling is really mature and stable, and it is quite simple to package any type of application into a docker image.

## Example features

Refer to the [full documentation at lostdock.com](https://lostdock.com) for an exhaustive list of features.
This is just a summary of some key commands to give you a feeling for the tool.

- `lostdock login`: Configure your SSH connection
- `lostdock server init`: install docker and docker compose on a new server
- `lostdock stacks install`:
  - Run `./install-local.sh` (validate configuration)
  - Push stack
  - Run `./install-server.sh` (preparation before starting stack. E.g. change permissions, create volumes, networks, etc)
  - Run `docker compose up`.
- `lostdock stacks install-from-git`: Same than install, but from a github repository including a `docker-compose.yml`. Useful to share pre-configured stacks.
- `lostdock stacks`: Manage stacks
- `lostdock stacks env`: Environment variable management
- `lostdock stacks up`: Start/Restart the stack
- `lostdock stacks down`: Stop the stack

Please refer to the [full documentation at lostdock.com](https://lostdock.com)

## License

MIT
