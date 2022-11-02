import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';

export const execScript = (scriptName: string, args?: string[]) =>
  exec.exec(path.join(path.dirname(__filename), scriptName), args);

const cacheConfig = (cachePath: string, keyInput: string, restoreKeyInput: string) => {
  const saveKey = core.getInput(keyInput);
  const cacheStateId = keyInput;
  const restoreKeys = core.getInput(restoreKeyInput).split('\n');
  return {
    path: cachePath,
    key: saveKey,
    shouldSave: () => {
      const restoredKey = core.getState(`${cacheStateId}-restored-key`);
      return saveKey !== restoredKey;
    },
    restore: async () => {
      const restoredKey = await cache.restoreCache([cachePath], saveKey, restoreKeys);
      core.saveState(`${cacheStateId}-restored-key`, restoredKey);
      return restoredKey;
    },
    save: () => cache.saveCache([cachePath], saveKey),
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
