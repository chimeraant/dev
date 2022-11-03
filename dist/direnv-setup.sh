#!/usr/bin/env bash

set -euo pipefail

echo "::group::direnv allow"
/nix/var/nix/profiles/default/bin/direnv allow
echo "::endgroup::"

echo "::group::Exporting direnv environment variables to GitHub Action"
/nix/var/nix/profiles/default/bin/direnv export gha >> "$GITHUB_ENV"
echo "::endgroup::"
