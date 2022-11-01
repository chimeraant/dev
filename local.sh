#!/usr/bin/env bash

set -euo pipefail

{
  echo "eval \"\$(direnv hook bash)\"" >> ~/.bashrc
}
