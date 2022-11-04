import {
  direnvCache,
  nixCache,
  pnpmCache,
  projectCache,
  saveCache,
  shouldSaveCache,
} from './cache';
import { prettyExec } from './exec';
import * as NIX_STORE from './nix-store';

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

const direnvCacheCleanup = async () => {
  if (await shouldSaveCache(direnvCache)) {
    await saveCache(direnvCache);
  }
};

const projectCacheCleanup = async () => {
  if (await shouldSaveCache(projectCache)) {
    await saveCache(projectCache);
  }
};

export const cleanup = () =>
  Promise.all([nixCacheCleanup(), pnpmCacheCleanup(), direnvCacheCleanup(), projectCacheCleanup()]);
