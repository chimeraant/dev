#!/usr/bin/env bash

set -euo pipefail

source "$HOME/.profile"
source $HOME/.nix-profile/share/nix-direnv/direnvrc

echo "::group::direnv allow"
direnv allow
echo "::endgroup::"

echo "::group::Exporting direnv environment variables to GitHub Action"
direnv export gha >> "$GITHUB_ENV"
echo "::endgroup::"
