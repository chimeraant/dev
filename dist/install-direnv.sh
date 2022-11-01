#!/usr/bin/env bash

# stripped version of https://direnv.net/install.sh

set -euo pipefail

{
  curl -o "/usr/local/bin/direnv" -fL "https://github.com/direnv/direnv/releases/download/v${DIRENV_VERSION}/direnv.linux-amd64"
  chmod +x "/usr/local/bin/direnv"
}
