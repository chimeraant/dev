#!/usr/bin/env bash

set -euo pipefail

source $HOME/.nix-profile/share/nix-direnv/direnvrc
echo "::group::Importing to Nix Store"
nix copy --no-check-sigs --from $1 ./#devShell.x86_64-linux
echo "::endgroup::"
