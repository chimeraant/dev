import {
  Cache,
  direnvCache,
  nixCache,
  nixInstallerCache,
  pnpmCache,
  projectCache,
  saveCache,
  shouldSaveCache,
} from './cache';
import { prettyExec } from './exec';
import * as NIX_STORE from './nix-store';

const simpleCleanup = async (cache: Cache) => {
  if (await shouldSaveCache(cache)) {
    await saveCache(cache);
  }
};

const nixCacheCleanup = async () => {
  if (await shouldSaveCache(nixCache)) {
    await NIX_STORE.exportTo(nixCache.path);
    await saveCache(nixCache);
  }
};

const pnpmCacheCleanup = async () => {
  if (await shouldSaveCache(pnpmCache)) {
    await prettyExec('pnpm', ['store', 'prune']);
    await saveCache(pnpmCache);
  }
};

export const cleanup = () =>
  Promise.all([
    nixCacheCleanup(),
    pnpmCacheCleanup(),
    simpleCleanup(direnvCache),
    simpleCleanup(projectCache),
    simpleCleanup(nixInstallerCache),
  ]);
