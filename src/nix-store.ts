import { prettyExec } from './exec';

const devShellPath = './#devShell.x86_64-linux';

export const importFrom = async (_nixCachePath: string) => {
  await prettyExec('sudo', ['chmod', '-R', '777', '/nix']);
  await prettyExec('nix', ['copy', devShellPath, '--from', '/', '--no-check-sigs']);
};

export const exportTo = async (_nixCachePath: string) => {
  await prettyExec('nix', ['store', 'gc']);
  await prettyExec('nix', ['store', 'optimise']);
  await prettyExec('nix', ['copy', devShellPath, '--to', '/', '--no-check-sigs']);
};
