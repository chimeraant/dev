#!/usr/bin/env bash

set -euo pipefail

echo "::group::Importing to Nix Store"
nix copy --from "file://$1"
echo "::endgroup::"
