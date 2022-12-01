#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail
if [[ "${TRACE-0}" == "1" ]]; then set -o xtrace; fi
cd "$(dirname "$0")"

main() {
    local PORTAINER_HOST="${PORTAINER_HOST-$(./.env.sh get PORTAINER_HOST)}"
    if [[ -z "${PORTAINER_HOST-}" ]]; then
        echo "PORTAINER_HOST is not set"
        exit 1
    fi
    ./.env.sh set PORTAINER_HOST="${PORTAINER_HOST}"
}

main "$@"
