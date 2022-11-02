import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';

export const execScript = (scriptName: string, args?: string[]) =>
  exec.exec(path.join(path.dirname(__filename), scriptName), args);

const cacheConfig = (cachePath: string, keyInput: string, restoreKeyInput: string) => {
  const key = core.getInput(keyInput);
  const restoreKeys = core.getInput(restoreKeyInput).split('\n');
  return {
    path: cachePath,
    key,
    isHit: () => core.getState(key) === 'true',
    restore: async () => {
      const cached = await cache.restoreCache([cachePath], key, restoreKeys);
      const result = cached === undefined ? 'false' : 'true';
      core.saveState(key, result);
      return result;
    },
    save: () => cache.saveCache([cachePath], key),
  };
};

export const nixCache = cacheConfig(
  '/tmp/nixcache',
  'nix-store-cache-key',
  'nix-store-cache-restore-keys'
);
export const pnpmCache = cacheConfig(
  '~/.local/share/pnpm/store/v3',
  'pnpm-store-cache-key',
  'pnpm-store-restore-keys'
);
