#!/usr/bin/env bash

set -euo pipefail

echo "::group::Importing to Nix Store"
ls "$1" | wc -l
nix-store --import < "$1"
echo "::endgroup::"
