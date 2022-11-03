{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable-small";
  };

  outputs = { self, nixpkgs }: with nixpkgs.legacyPackages.x86_64-linux;
    let
      stdenvMinimal = nixpkgs.stdenvNoCC.override {
        cc = null;
        preHook = "";
        allowedRequisites = null;
        initialPath = nixpkgs.lib.filter
          (a: nixpkgs.lib.hasPrefix "coreutils" a.name)
          nixpkgs.stdenvNoCC.initialPath;
        extraNativeBuildInputs = [ ];
      };
      minimalMkShell = nixpkgs.mkShell.override {
        stdenv = stdenvMinimal;
      };
    in
    {
      devShell.x86_64-linux = minimalMkShell {
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
          [ ! -d "node_modules" ] && pnpm install
        '';
      };
    };
}
