import * as exec from '@actions/exec';

import { direnvCache, nixCache, pnpmCache, saveCache, shouldSaveCache } from './cache';
import * as NIX_STORE from './nix-store';

const nixCacheCleanup = async () => {
  if (await shouldSaveCache(nixCache)) {
    await NIX_STORE.exportTo(nixCache.path);
    await saveCache(nixCache);
  }
};

const pnpmCacheCleanup = async () => {
  if (await shouldSaveCache(pnpmCache)) {
    await exec.exec('pnpm', ['store', 'prune']);
    await saveCache(pnpmCache);
  }
};

const direnvCacheCleanup = async () => {
  if (await shouldSaveCache(direnvCache)) {
    await saveCache(direnvCache);
  }
};

export const cleanup = () =>
  Promise.all([nixCacheCleanup(), pnpmCacheCleanup(), direnvCacheCleanup()]);
