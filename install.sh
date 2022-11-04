#!/usr/bin/env bash

set -euo pipefail

{

  export nix_version="2.11.0"
  if $(type -p nix &>/dev/null) && [[ $(nix --version) == "nix (Nix) $nix_version" ]] ; then
    echo "nix $nix_version is already installed at $(type -p nix). Skipping installation."
  else
    # Create a temporary workdir
    workdir=$(mktemp -d)
    trap 'rm -rf "$workdir"' EXIT
    printf "max-jobs = auto\ntrusted-users = $USER\nexperimental-features = nix-command flakes" >> "$workdir/nix.conf"
    sh <(curl -sfL "https://releases.nixos.org/nix/nix-$nix_version/install") --help
    sh <(curl -sfL "https://releases.nixos.org/nix/nix-$nix_version/install") \
      --no-channel-add \
      --daemon \
      --daemon-user-count "$(python3 -c 'import multiprocessing as mp; print(mp.cpu_count() * 2)')" \
      --nix-extra-conf-file "$workdir/nix.conf"
  fi

  export version="v2.32.1"
  if $(type -p direnv &>/dev/null) && [[ "v$(direnv --version)" == "$version" ]] ; then
    echo "direnv $version is already installed at $(type -p direnv). Skipping installation."
  else
    export bin_path="/usr/local/bin"
    curl -sfL https://raw.githubusercontent.com/direnv/direnv/db00133c845be3a01437b933936db5aa40977d30/install.sh | sudo --preserve-env bash
  fi

  line='eval "\$(direnv hook bash)"'
  file="$HOME/.bashrc"
  grep -qF -- "$line" "$file" || echo "$line" >> "$file"
  source "$file"
}
