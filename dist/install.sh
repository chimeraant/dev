#!/usr/bin/env bash

set -euo pipefail

{

  INPUT_EXTRA_NIX_CONFIG= \
  INPUT_INSTALL_OPTIONS= \
  INPUT_INSTALL_URL= \
  INPUT_NIX_PATH="nixpkgs=channel:nixos-unstable" \
  curl -sfL https://raw.githubusercontent.com/cachix/install-nix-action/master/install-nix.sh | bash

  nix-env -f '<nixpkgs>' -iA direnv

  LINE='eval "\$(direnv hook bash)"'
  FILE="$HOME/.profile"
  grep -qF -- "$LINE" "$FILE" || echo "$LINE" >> "$FILE"

}
