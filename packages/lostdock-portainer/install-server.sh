#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail
if [[ "${TRACE-0}" == "1" ]]; then set -o xtrace; fi
cd "$(dirname "$0")"
source .env

main() {
    echo "Setting the right permissions"
    chown -R 10001:10001 data
}

main "$@"
