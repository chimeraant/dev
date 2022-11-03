#!/usr/bin/env bash

set -euo pipefail

source "$HOME/.profile"
source $HOME/.nix-profile/share/nix-direnv/direnvrc

echo "::group::direnv allow"
/nix/var/nix/profiles/default/bin/direnv allow
echo "::endgroup::"

echo "::group::Exporting direnv environment variables to GitHub Action"
/nix/var/nix/profiles/default/bin/direnv export gha >> "$GITHUB_ENV"
echo "::endgroup::"
