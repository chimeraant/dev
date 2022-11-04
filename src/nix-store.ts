import { prettyExec } from './exec';

const devShellPath = './#devShell.x86_64-linux';

export const importFrom = (nixCachePath: string) =>
  prettyExec('nix', ['copy', devShellPath, '--from', nixCachePath, '--no-check-sigs']);

export const exportTo = async (nixCachePath: string) => {
  await prettyExec('nix', ['store', 'gc']);
  await prettyExec('nix', ['store', 'optimise']);
  await prettyExec('nix', ['copy', devShellPath, '--to', nixCachePath, '--no-check-sigs']);
};
