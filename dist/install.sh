#!/usr/bin/env bash

set -euo pipefail

{
  # Ignore GITHUB_PATH and GITHUB_ENV for local installation
  # GITHUB_PATH from the downloaded script is not added to path anyway
  # Path export is instead done using js toolkit
  export GITHUB_PATH=/dev/null
  export INPUT_EXTRA_NIX_CONFIG=
  export INPUT_INSTALL_OPTIONS=
  export INPUT_INSTALL_URL="https://releases.nixos.org/nix/nix-2.11.0/install"
  export INPUT_NIX_PATH=
  curl -sfL https://raw.githubusercontent.com/cachix/install-nix-action/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh | bash

  echo "::group::Installing direnv"
  export bin_path="/usr/local/bin"
  export version="v2.32.1"
  curl -sfL https://direnv.net/install.sh | sudo --preserve-env bash
  echo "::endgroup::"
}
