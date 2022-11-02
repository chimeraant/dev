#!/usr/bin/env bash

set -euo pipefail

echo "::group::Optimising Nix Store"
nix-store --optimise
echo "::endgroup::"

echo "::group::Exporting nix store to ${1}"
nix-store --export $(find /nix/store -maxdepth 1 -name '*-*') > "$1"
echo "::endgroup::"
