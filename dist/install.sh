#!/usr/bin/env bash

set -euo pipefail

{
  curl -sfL https://raw.githubusercontent.com/cachix/install-nix-action/master/install-nix.sh | bash

  echo "::group::Installing direnv"
  curl -sfL https://direnv.net/install.sh | bash
  echo "::endgroup::"
}
