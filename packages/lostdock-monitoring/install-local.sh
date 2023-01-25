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

    local PROMETHEUS_HOST="${PROMETHEUS_HOST-$(./.env.sh get PROMETHEUS_HOST)}"
    if [[ -z "${PROMETHEUS_HOST-}" ]]; then
        echo "PROMETHEUS_HOST is not set"
        exit 1
    fi
    ./.env.sh set PROMETHEUS_HOST="${PROMETHEUS_HOST}"

    local PROMETHEUS_BASIC_AUTH="${PROMETHEUS_BASIC_AUTH-$(./.env.sh get PROMETHEUS_BASIC_AUTH)}"
    if [[ -z "${PROMETHEUS_BASIC_AUTH-}" ]]; then
        echo "PROMETHEUS_BASIC_AUTH is not set"
        exit 1
    fi
    ./.env.sh set PROMETHEUS_BASIC_AUTH="${PROMETHEUS_BASIC_AUTH}"

    local ALERTMANAGER_HOST="${ALERTMANAGER_HOST-$(./.env.sh get ALERTMANAGER_HOST)}"
    if [[ -z "${ALERTMANAGER_HOST-}" ]]; then
        echo "ALERTMANAGER_HOST is not set"
        exit 1
    fi
    ./.env.sh set ALERTMANAGER_HOST="${ALERTMANAGER_HOST}"

    local ALERTMANAGER_BASIC_AUTH="${ALERTMANAGER_BASIC_AUTH-$(./.env.sh get ALERTMANAGER_BASIC_AUTH)}"
    if [[ -z "${ALERTMANAGER_BASIC_AUTH-}" ]]; then
        echo "ALERTMANAGER_BASIC_AUTH is not set"
        exit 1
    fi
    ./.env.sh set ALERTMANAGER_BASIC_AUTH="${ALERTMANAGER_BASIC_AUTH}"
}

main "$@"
