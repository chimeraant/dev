{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable-small";
  };
 
  outputs = { self, nixpkgs }: with nixpkgs.legacyPackages.x86_64-linux; {
    devShell.x86_64-linux = mkShell {
      buildInputs = [
        nodejs-16_x
        nodePackages.pnpm
        playwright
        playwright.browsers-chromium
      ];

      shellHook = ''
        export PLAYWRIGHT_BROWSERS_PATH=${playwright.browsers-chromium}
        export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
        function assertEqual {
          result="$(eval "$1")"
          if [[ "$result" != "$2" ]]; then
            echo -e "\033[0;31m"
            echo -e "Invalid $1"
            echo -e "Actual: $result"
            echo -e "Expected: $2"
            echo -e "\033[0m"
          fi
        }
        assertEqual "nix --version" "nix (Nix) 2.11.0" || exit 1
        pnpm install
      '';
    };
  };
}
