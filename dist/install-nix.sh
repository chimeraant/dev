#!/usr/bin/env bash

set -euo pipefail

{
  # Create a temporary workdir
  workdir=$(mktemp -d)
  trap 'rm -rf "$workdir"' EXIT
# stripped version of https://direnv.net/install.sh
  curl -o "/usr/local/bin/direnv" -fL "https://github.com/direnv/direnv/releases/download/v${DIRENV_VERSION}/direnv.linux-amd64"
  chmod +x "/usr/local/bin/direnv"

  curl_retries=5
  while ! curl -sS -o "$workdir/install" -v --fail -L "${INPUT_INSTALL_URL:-https://nixos.org/nix/install}"
  do
    sleep 1
    ((curl_retries--))
    if [[ $curl_retries -le 0 ]]; then
      echo "curl retries failed" >&2
      exit 1
    fi
  done

  INPUT_INSTALL_URL="https://releases.nixos.org/nix/nix-${NIX_VERSION}/install"sh "$workdir/install"
}
