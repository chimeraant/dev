import { prettyExec } from './exec';

const devShellPath = './#devShell.x86_64-linux';

export const importFrom = (_nixCachePath: string) =>
  prettyExec('nix', ['copy', devShellPath, '--from', '/nix/store', '--no-check-sigs']);

export const exportTo = async (_nixCachePath: string) => {
  await prettyExec('nix', ['store', 'gc']);
  await prettyExec('nix', ['store', 'optimise']);
  await prettyExec('nix', ['copy', devShellPath, '--to', '/nix/store', '--no-check-sigs']);
};
