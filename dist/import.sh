#!/usr/bin/env bash

set -euo pipefail

echo "::group::Importing to Nix Store"
nix-store --import < "$1"
echo "::endgroup::"
