#!/usr/bin/env bash

set -euo pipefail

{

  INPUT_EXTRA_NIX_CONFIG= \
  INPUT_INSTALL_OPTIONS= \
  INPUT_INSTALL_URL= \
  INPUT_NIX_PATH= \
  # ignore GITHUB_PATH for local installation
  # GITHUB_PATH from the downloaded script is not added to path anyway
  # path export is instead done using js toolkit
  GITHUB_PATH=/dev/null \
  bash <(curl -sfL https://raw.githubusercontent.com/cachix/install-nix-action/master/install-nix.sh)

  echo "::group::Installing direnv"
  curl -sfL https://direnv.net/install.sh | sudo bash
  LINE='eval "\$(direnv hook bash)"'
  FILE="$HOME/.profile"
  grep -qF -- "$LINE" "$FILE" || echo "$LINE" >> "$FILE"
  echo "::endgroup::"
}
