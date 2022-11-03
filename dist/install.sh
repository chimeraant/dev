#!/usr/bin/env bash

set -euo pipefail

{

  # Ignore GITHUB_PATH and GITHUB_ENV for local installation
  # GITHUB_PATH from the downloaded script is not added to path anyway
  # Path export is instead done using js toolkit
  INPUT_EXTRA_NIX_CONFIG= \
  INPUT_INSTALL_OPTIONS= \
  INPUT_INSTALL_URL="https://releases.nixos.org/nix/nix-2.11.0/install" \
  INPUT_NIX_PATH="ixpkgs=channel:nixos-unstable" \
  GITHUB_PATH=/dev/null \
  GITHUB_ENV=/dev/null \
  bash <(curl -sfL https://raw.githubusercontent.com/cachix/install-nix-action/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh)

  nix-env --install --attr direnv nix-direnv -f '<nixpkgs>'
  echo "source $HOME/.nix-profile/share/nix-direnv/direnvrc" >> $HOME/.direnvrc

  LINE='eval "\$(direnv hook bash)"'
  FILE="$HOME/.profile"
  grep -qF -- "$LINE" "$FILE" || echo "$LINE" >> "$FILE"
  echo "::endgroup::"
}
