#!/usr/bin/env bash

set -euo pipefail

{
  # https://raw.githubusercontent.com/cachix/install-nix-action/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh
  echo "::group::Installing Nix"

  workdir=$(mktemp -d)
  trap 'rm -rf "$workdir"' EXIT

  printf "max-jobs = auto\ntrusted-users = $USER\nexperimental-features = nix-command flakes" | tee -a "$workdir/nix.conf" >/dev/null

  curl -o "$workdir/install" -fL "https://releases.nixos.org/nix/nix-2.11.0/install"
  sh "$workdir/install" \
    --no-channel-add \
    --nix-extra-conf-file "$workdir/nix.conf" \
    --daemon \
    --daemon-user-count "$(python3 -c 'import multiprocessing as mp; print(mp.cpu_count() * 2)')"

  echo "::endgroup::"

  # https://github.com/direnv/direnv/blob/c259d68a5b1bc9ca71c63368ea0fa9e0849565e0/install.sh
  echo "::group::Installing direnv"

  : "${bin_path:=}"
  for path in $(echo "$PATH" | tr ':' '\n'); do
    if [[ -w $path ]]; then
      bin_path=$path
      break
    fi
  done
  echo "bin_path=$bin_path"
  if [[ -z "$bin_path" ]]; then
    echo "did not find a writeable path in $PATH"
    exit 1
  fi

  curl -o "$bin_path/direnv" -fL "https://github.com/direnv/direnv/releases/download/v2.32.1/direnv.linux-amd64"
  chmod +x "$bin_path/direnv"

  echo "::endgroup::"
}
