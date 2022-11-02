#!/usr/bin/env bash

set -euo pipefail

{

  # Ignore GITHUB_PATH for local installation
  # GITHUB_PATH from the downloaded script is not added to path anyway
  # Path export is instead done using js toolkit
  INPUT_EXTRA_NIX_CONFIG= \
  INPUT_INSTALL_OPTIONS= \
  INPUT_INSTALL_URL="https://releases.nixos.org/nix/nix-2.11.0/install" \
  INPUT_NIX_PATH= \
  GITHUB_PATH=/dev/null \
  bash <(curl -sfL https://raw.githubusercontent.com/cachix/install-nix-action/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh)

  # Stripped version of https://github.com/direnv/direnv/blob/fe2123fc729b7a6a5954460282810dd226263c4e/install.sh
  # Able to pin direnv version and cache the direnv binary
  echo "::group::Installing direnv"
  : "${bin_path:=}"
  : "${cache_path:=}"

  if [[ -z "$bin_path" ]]; then
    for path in $(echo "$PATH" | tr ':' '\n'); do
      if [[ -w $path ]]; then
        bin_path=$path
        break
      fi
    done
  fi
  if [[ -z "$bin_path" ]]; then
    echo "did not find a writeable path in $PATH"
    exit 1
  fi
  echo "bin_path=$bin_path"

  if [[ -z "$cache_path" ]]; then
    curl -o "$bin_path/direnv" -fL "https://github.com/direnv/direnv/releases/download/v2.32.1/direnv.linux-amd64"
  else
    cp "$cache_path" "$bin_path/direnv"
  fi
  chmod +x "$bin_path/direnv"

  LINE='eval "\$(direnv hook bash)"'
  FILE="$HOME/.profile"
  grep -qF -- "$LINE" "$FILE" || echo "$LINE" >> "$FILE"
  echo "::endgroup::"
}
