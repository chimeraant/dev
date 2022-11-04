import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

import { direnv, execScript, getNixCache, getPnpmCache } from './util';

const cacheAndInstall = async () => {
  const restoredKey = await cache.restoreCache([`${direnv.installBinDir}/direnv`], direnv.cacheKey);
  const isDirenvCacheHit = `${restoredKey !== undefined}`;
  core.saveState(direnv.stateKey, isDirenvCacheHit);

  await execScript('install.sh', [], {
    env: {
      ...process.env,
      direnv_bin_path: direnv.installBinDir,
      direnv_version: direnv.version,
    },
  });
};

const setupNixCache = async () => {
  const nixCache = await getNixCache();
  const restoredCacheKey = await nixCache.restore();
  return [nixCache, restoredCacheKey] as const;
};

const setupNixDirenv = async () => {
  const [[nixCache, restoredCacheKey]] = await Promise.all([setupNixCache(), cacheAndInstall()]);

  if (restoredCacheKey !== undefined) {
    await exec.exec('nix', [
      'copy',
      '--no-check-sigs',
      '--from',
      nixCache.path,
      './#devShell.x86_64-linux',
    ]);
  }

  await exec.exec('direnv', ['allow']);
  await execScript('direnv-setup.sh');
};

const pnpmRestore = async () => {
  const pnpmCache = await getPnpmCache();
  await pnpmCache.restore();
};

const run = async () => {
  try {
    // https://github.com/cachix/install-nix-action/blob/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh#L84-L85
    core.addPath('/nix/var/nix/profiles/default/bin');
    core.addPath(`/nix/var/nix/profiles/per-user/${process.env['USER']}/bin`);

    await Promise.all([setupNixDirenv(), pnpmRestore()]);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
};

run();
