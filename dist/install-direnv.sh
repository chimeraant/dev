#!/usr/bin/env bash

# stripped version of https://direnv.net/install.sh

set -euo pipefail

touch ~/.profile
source ~/.profile

touch ~/.bashrc
source ~/.bashrc

curl -o "/usr/local/bin/direnv" -fL "https://github.com/direnv/direnv/releases/download/v${DIRENV_VERSION}/direnv.linux-amd64"
chmod +x "/usr/local/bin/direnv"

echo "eval \"\$(direnv hook bash)\"" >> ~/.profile
source ~/.profile

echo "eval \"\$(direnv hook bash)\"" >> ~/.bashrc
source ~/.bashrc

direnv allow
direnv export gha >> "$GITHUB_ENV"


bash ./direnv-allow.sh
