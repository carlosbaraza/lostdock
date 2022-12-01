#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail
if [[ "${TRACE-0}" == "1" ]]; then set -o xtrace; fi
cd "$(dirname "$0")"

main() {
    local GRAFANA_HOST="${GRAFANA_HOST-$(./.env.sh get GRAFANA_HOST)}"
    if [[ -z "${GRAFANA_HOST-}" ]]; then
        echo "GRAFANA_HOST is not set"
        exit 1
    fi
    ./.env.sh set GRAFANA_HOST="${GRAFANA_HOST}"

    local NETDATA_HOST="${NETDATA_HOST-$(./.env.sh get NETDATA_HOST)}"
    if [[ -z "${NETDATA_HOST-}" ]]; then
        echo "NETDATA_HOST is not set"
        exit 1
    fi
    ./.env.sh set NETDATA_HOST="${NETDATA_HOST}"

    local NETDATA_BASIC_AUTH="${NETDATA_BASIC_AUTH-$(./.env.sh get NETDATA_BASIC_AUTH)}"
    if [[ -z "${NETDATA_BASIC_AUTH-}" ]]; then
        echo "NETDATA_BASIC_AUTH is not set"
        exit 1
    fi
    ./.env.sh set NETDATA_BASIC_AUTH="${NETDATA_BASIC_AUTH}"
}

main "$@"
