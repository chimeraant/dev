{
  outputs = { self, nixpkgs }: with nixpkgs.legacyPackages.x86_64-linux; {
    devShell.x86_64-linux = mkShell {
      buildInputs = [
        nodejs-16_x
        nodePackages.pnpm
      ];
    };
  };
}
