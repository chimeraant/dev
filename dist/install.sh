#!/usr/bin/env bash

set -euo pipefail

{
  # Ignore GITHUB_PATH and GITHUB_ENV for local installation
  # GITHUB_PATH from the downloaded script is not added to path anyway
  # Path export is instead done using js toolkit
  INPUT_EXTRA_NIX_CONFIG= \
  INPUT_INSTALL_OPTIONS= \
  INPUT_INSTALL_URL="https://releases.nixos.org/nix/nix-2.11.0/install" \
  INPUT_NIX_PATH= \
  GITHUB_PATH=/dev/null \
    bash <(curl -sfL https://raw.githubusercontent.com/cachix/install-nix-action/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh)

  echo "::group::Installing direnv"
  if $(type -p direnv &>/dev/null) && [[ "v$(direnv --version)" == "$direnv_version" ]] ; then
    echo "Aborting: Direnv version v$(direnv --version) is already installed at $(type -p direnv)"
  else
    bin_path="$direnv_bin_path"
    version="$direnv_version"
    log() {
      echo "[installer] $*" >&2
    }

    die() {
      log "$@"
      exit 1
    }

    at_exit() {
      ret=$?
      if [[ $ret -gt 0 ]]; then
        log "the script failed with error $ret.\n" \
          "\n" \
          "To report installation errors, submit an issue to\n" \
          "    https://github.com/direnv/direnv/issues/new/choose"
      fi
      exit "$ret"
    }
    trap at_exit EXIT

    kernel=$(uname -s | tr "[:upper:]" "[:lower:]")
    case "${kernel}" in
      mingw*)
        kernel=windows
        ;;
    esac
    case "$(uname -m)" in
      x86_64)
        machine=amd64
        ;;
      i686 | i386)
        machine=386
        ;;
      aarch64 | arm64)
        machine=arm64
        ;;
      *)
        die "Machine $(uname -m) not supported by the installer.\n" \
          "Go to https://direnv for alternate installation methods."
        ;;
    esac
    log "kernel=$kernel machine=$machine"

    : "${use_sudo:=}"
    : "${bin_path:=}"

    if [[ -z "$bin_path" ]]; then
      log "bin_path is not set, you can set bin_path to specify the installation path"
      log "e.g. export bin_path=/path/to/installation before installing"
      log "looking for a writeable path from PATH environment variable"
      for path in $(echo "$PATH" | tr ':' '\n'); do
        if [[ -w $path ]]; then
          bin_path=$path
          break
        fi
      done
    fi
    if [[ -z "$bin_path" ]]; then
      die "did not find a writeable path in $PATH"
    fi
    echo "bin_path=$bin_path"

    if [[ -n "$version" ]]; then
      release="tags/${version}"
    else
      release="latest"
    fi

    log "looking for a download URL"
    download_url=$(
      curl -fL "https://api.github.com/repos/direnv/direnv/releases/$release" \
      | grep browser_download_url \
      | cut -d '"' -f 4 \
      | grep "direnv.$kernel.$machine"
    )
    echo "download_url=$download_url"

    log "downloading"
    curl -o "$bin_path/direnv" -fL "$download_url"
    chmod +x "$bin_path/direnv"

    echo "::endgroup::"
  fi
}
