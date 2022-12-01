#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail
if [[ "${TRACE-0}" == "1" ]]; then set -o xtrace; fi
cd "$(dirname "$0")"
source .env

main() {
    echo "Installing Docker Loki Driver"
    docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions || true
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

    echo "Setting the right permissions"
    sudo chown -R 472:472 grafana/data
    sudo chown -R 1000:1000 prometheus/data
    sudo chown -R 10001:10001 loki/data
    sudo chown -R 201:201 netdata/data
    sudo chown -R 201:201 netdata/lib
    sudo chown -R 201:201 netdata/cache
}

main "$@"
