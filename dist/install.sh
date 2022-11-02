#!/usr/bin/env bash

set -euo pipefail

{
  export INPUT_EXTRA_NIX_CONFIG=
  export INPUT_INSTALL_OPTIONS=
  export INPUT_INSTALL_URL=
  export INPUT_NIX_PATH=
  curl -sfL https://raw.githubusercontent.com/cachix/install-nix-action/master/install-nix.sh | bash

  echo "::group::Installing direnv"
  curl -sfL https://direnv.net/install.sh | bash
  echo "::endgroup::"

  LINE='eval "\$(direnv hook bash)"'
  FILE="$HOME/.profile"
  grep -qF -- "$LINE" "$FILE" || echo "$LINE" >> "$FILE"
}
