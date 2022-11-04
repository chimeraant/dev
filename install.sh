#!/usr/bin/env bash

set -euo pipefail

{
  export GITHUB_PATH=/dev/null
  export INPUT_EXTRA_NIX_CONFIG=
  export INPUT_INSTALL_OPTIONS=
  export INPUT_INSTALL_URL="https://releases.nixos.org/nix/nix-2.11.0/install"
  export INPUT_NIX_PATH=
  curl -sfL https://raw.githubusercontent.com/cachix/install-nix-action/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh | bash

  export version="v2.32.1"
  if $(type -p direnv &>/dev/null) && [[ "v$(direnv --version)" == "$version" ]] ; then
    echo "Aborting: Direnv $version is already installed at $(type -p direnv)"
  else
    echo "::group::Installing direnv"
    export bin_path="/usr/local/bin"
    curl -sfL https://raw.githubusercontent.com/direnv/direnv/db00133c845be3a01437b933936db5aa40977d30/install.sh | sudo --preserve-env bash
    echo "::endgroup::"
  fi

  line='eval "\$(direnv hook bash)"'
  file="$HOME/.bashrc"
  grep -qF -- "$line" "$file" || echo "$line" >> "$file"
  source "$file"
  echo "::endgroup::"
}
