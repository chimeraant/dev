import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as p from 'path';

import { Cache, restoreCache, saveCache, shouldSaveCache } from './cache';
import * as DIRENV from './direnv';
import * as NIX_STORE from './nix-store';

const nixCache: Cache = {
  path: '/tmp/nixcache',
  patterns: ['flake.nix', 'flake.lock'],
  key: 'nix-store',
};

const pnpmCache: Cache = {
  path: `~/.local/share/pnpm/store/v3`,
  patterns: ['**/pnpm-lock.yaml', '!.direnv/**'],
  key: 'pnpm-store',
};

const direnvCache: Cache = {
  path: `/usr/local/bin/direnv`,
  key: 'direnv-v2.32.1',
};

const install = async () => {
  await restoreCache(direnvCache);
  await exec.exec(`${p.dirname(__filename)}/../install.sh`);
};

const setupNixDirenv = async () => {
  const [nixCacheExists] = await Promise.all([restoreCache(nixCache), install()]);

  if (nixCacheExists) {
    await NIX_STORE.importFrom(nixCache.path);
  }
};

const setup = async () => {
  // https://github.com/cachix/install-nix-action/blob/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh#L84-L85
  core.addPath('/nix/var/nix/profiles/default/bin');

  await Promise.all([setupNixDirenv(), restoreCache(pnpmCache)]);
  await DIRENV.setup();
};

const cleanup = async () => {
  await Promise.all([
    async () => {
      if (await shouldSaveCache(nixCache)) {
        await NIX_STORE.exportTo(nixCache.path);
        await saveCache(nixCache);
      }
    },
    async () => {
      if (await shouldSaveCache(pnpmCache)) {
        await exec.exec('pnpm', ['store', 'prune']);
        await saveCache(pnpmCache);
      }
    },
    async () => {
      if (await shouldSaveCache(direnvCache)) {
        await saveCache(direnvCache);
      }
    },
  ]);
};

const run = async () => {
  try {
    if (core.getState('is_post') === 'true') {
      return await cleanup();
    }
    core.saveState('is_post', 'true');
    return await setup();
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error);
    }
  }
};

run();
