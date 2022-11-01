#!/usr/bin/env bash

set -euo pipefail

{
  # Create a temporary workdir
  workdir=$(mktemp -d)
  trap 'rm -rf "$workdir"' EXIT

  INPUT_INSTALL_URL="https://releases.nixos.org/nix/nix-${NIX_VERSION}/install"

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

  sh "$workdir/install"
}
