import { cacheCleanup, direnvCache, pnpmCache, projectCache, ultraCache } from './cache';
import { prettyExec } from './exec';
// import * as NIX_STORE from './nix-store';
//
const ultraCleanup = async () => {
  await prettyExec('nix', ['store', 'gc']);
  await prettyExec('nix', ['store', 'optimise']);
  await cacheCleanup(ultraCache);
};

export const cleanup = () =>
  Promise.all([
    // cacheCleanup(nixCache, { runBeforeSave: () => NIX_STORE.exportTo(nixCache.path) }),
    ultraCleanup(),
    cacheCleanup(pnpmCache, { runBeforeSave: () => prettyExec('pnpm', ['store', 'prune']) }),
    cacheCleanup(direnvCache),
    cacheCleanup(projectCache),
  ]);
