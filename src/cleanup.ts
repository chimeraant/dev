import { cacheCleanup, direnvCache, nixCache, pnpmCache, projectCache } from './cache';
import { prettyExec } from './exec';
import * as NIX_STORE from './nix-store';

export const cleanup = () =>
  Promise.all([
    cacheCleanup(nixCache, { runBeforeSave: () => NIX_STORE.exportTo(nixCache.path) }),
    cacheCleanup(pnpmCache, { runBeforeSave: () => prettyExec('pnpm', ['store', 'prune']) }),
    cacheCleanup(direnvCache),
    cacheCleanup(projectCache),
  ]);
