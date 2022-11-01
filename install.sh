#!/usr/bin/env bash

set -euo pipefail

export INPUT_INSTALL_URL="https://releases.nixos.org/nix/nix-2.11.0/install" 
export INPUT_INSTALL_OPTIONS=""
export INPUT_NIX_PATH=""
export INPUT_EXTRA_NIX_CONFIG=""

# Create a temporary workdir
workdir=$(mktemp -d)
trap 'rm -rf "$workdir"' EXIT

curl -o "$workdir/install" -fL "https://raw.githubusercontent.com/cachix/install-nix-action/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh"
bash "$workdir/install"

curl -o "/usr/local/bin/direnv" -fL "https://github.com/direnv/direnv/releases/download/v2.32.1/direnv.linux-amd64"
chmod +x "/usr/local/bin/direnv"
