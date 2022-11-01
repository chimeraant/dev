#!/usr/bin/env bash

# stripped version of https://direnv.net/install.sh

set -euo pipefail

# Create a temporary workdir
workdir=$(mktemp -d)
trap 'rm -rf "$workdir"' EXIT

curl_retries=5
while ! curl -sS -o "$workdir/install" -v --fail -L "https://raw.githubusercontent.com/cachix/install-nix-action/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh"
do
  sleep 1
  ((curl_retries--))
  if [[ $curl_retries -le 0 ]]; then
    echo "curl retries failed" >&2
    exit 1
  fi
done

export INPUT_INSTALL_URL="https://releases.nixos.org/nix/nix-${NIX_VERSION}/install" 
export INPUT_INSTALL_OPTIONS=""
export INPUT_NIX_PATH=""
export INPUT_EXTRA_NIX_CONFIG=""
bash "$workdir/install"

curl -o "/usr/local/bin/direnv" -fL "https://github.com/direnv/direnv/releases/download/v${DIRENV_VERSION}/direnv.linux-amd64"
chmod +x "/usr/local/bin/direnv"
direnv allow
direnv export gha >> "$GITHUB_ENV"
