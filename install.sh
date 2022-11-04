#!/usr/bin/env bash

set -euo pipefail

{
  if type -p nix &>/dev/null ; then
    echo "Aborting: Nix is already installed at $(type -p nix)"
    exit
  fi

  workdir=$(mktemp -d)
  trap 'rm -rf "$workdir"' EXIT

  add_config() {
    echo "$1" | tee -a "$workdir/nix.conf" >/dev/null
  }
  add_config "max-jobs = auto"
  add_config "trusted-users = root $USER"
  add_config "experimental-features = nix-command flakes"

  sudo mkdir -p /etc/nix
  sudo chmod 0755 /etc/nix
  sudo cp $workdir/nix.conf /etc/nix/nix.conf

  sh <(curl -sfL "https://releases.nixos.org/nix/nix-2.11.0/install") \
    --no-channel-add \
    --nix-extra-conf-file "$workdir/nix.conf" \

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
