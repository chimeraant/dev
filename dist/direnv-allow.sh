#!/usr/bin/env bash

# stripped version of https://direnv.net/install.sh

set -euo pipefail

direnv allow
direnv export gha >> "$GITHUB_ENV"
