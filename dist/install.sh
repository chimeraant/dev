#!/usr/bin/env bash

set -euo pipefail

{
  # Ignore GITHUB_PATH and GITHUB_ENV for local installation
  # GITHUB_PATH from the downloaded script is not added to path anyway
  # Path export is instead done using js toolkit
  INPUT_EXTRA_NIX_CONFIG= \
  INPUT_INSTALL_OPTIONS= \
  INPUT_INSTALL_URL="https://releases.nixos.org/nix/nix-2.11.0/install" \
  INPUT_NIX_PATH= \
  GITHUB_PATH=/dev/null \
  bash <(curl -sfL https://raw.githubusercontent.com/cachix/install-nix-action/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh)

  echo "::group::Installing direnv"
  if $(type -p direnv &>/dev/null) && [[ "v$(direnv --version)" == "$direnv_version" ]] ; then
    echo "Aborting: Direnv version v$(direnv --version) is already installed at $(type -p direnv)"
    exit
  else
    bin_path="$direnv_bin_path" version="$direnv_version" sudo bash <(curl -L https://raw.githubusercontent.com/direnv/direnv/fe2123fc729b7a6a5954460282810dd226263c4e/install.sh)
  fi
  echo "::endgroup::"
}
