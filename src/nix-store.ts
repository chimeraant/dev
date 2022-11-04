import * as exec from '@actions/exec';

const devShellPath = './#devShell.x86_64-linux';

export const importFrom = (nixCachePath: string) =>
  exec.exec('nix', ['copy', devShellPath, '--from', nixCachePath, '--no-check-sigs']);

export const exportTo = async (nixCachePath: string) => {
  await exec.exec('nix', ['store', 'gc']);
  await exec.exec('nix', ['store', 'optimise']);
  await exec.exec('nix', ['copy', devShellPath, '--to', nixCachePath, '--no-check-sigs']);
};
