#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail
if [[ "${TRACE-0}" == "1" ]]; then set -o xtrace; fi
cd "$(dirname "$0")"

main() {
    if [[ -z "${TRAEFIK_HOST-}" ]]; then
        echo "TRAEFIK_HOST is not set"
        exit 1
    fi
    ./.env.sh set TRAEFIK_HOST="${TRAEFIK_HOST}"

    if [[ -z "${TRAEFIK_BASIC_AUTH-}" ]]; then
        echo "TRAEFIK_BASIC_AUTH is not set"
        exit 1
    fi
    ./.env.sh set TRAEFIK_BASIC_AUTH="${TRAEFIK_BASIC_AUTH}"

    if [[ -z "${LETSENCRYPT_EMAIL-}" ]]; then
        echo "LETSENCRYPT_EMAIL is not set"
        exit 1
    fi
    ./.env.sh set LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL}"
}

main "$@"
