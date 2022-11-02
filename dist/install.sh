#!/usr/bin/env bash

set -euo pipefail

{

  # ignore GITHUB_PATH for local installation
  # GITHUB_PATH from the downloaded script is not added to path anyway
  # path export is instead done using js toolkit
  INPUT_EXTRA_NIX_CONFIG= \
  INPUT_INSTALL_OPTIONS= \
  INPUT_INSTALL_URL= \
  INPUT_NIX_PATH= \
  GITHUB_PATH=/dev/null \
  bash <(curl -sfL https://raw.githubusercontent.com/cachix/install-nix-action/master/install-nix.sh)

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
