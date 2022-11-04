import { cacheCleanup, direnvCache, nixCache, pnpmCache } from './cache';
import { prettyExec } from './exec';

const ultraCleanup = async () => {
  await prettyExec('nix-store', ['--gc']);
  await prettyExec('nix-store', ['--optimise']);
  await cacheCleanup(nixCache);
};

export const cleanup = () =>
  Promise.all([
    ultraCleanup(),
    cacheCleanup(pnpmCache, { runBeforeSave: () => prettyExec('pnpm', ['store', 'prune']) }),
    cacheCleanup(direnvCache),
  ]);
