#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail
if [[ "${TRACE-0}" == "1" ]]; then set -o xtrace; fi
cd "$(dirname "$0")"
source .env

main() {
    echo "Creating the reverse proxy network"
    docker network create proxy || true

    # substitute env vars in config/traefik.template.yml
    eval "cat <<EOF
$(<config/traefik.template.yml)
EOF
" >config/traefik.yml
    touch letsencrypt/acme.json
    chmod 600 letsencrypt/acme.json
}

main "$@"
