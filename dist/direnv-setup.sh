#!/usr/bin/env bash

set -euo pipefail

echo "::group::Exporting direnv environment variables to GitHub Action"
direnv export gha >> "$GITHUB_ENV"
echo "::endgroup::"
