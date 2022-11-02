import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';

export const execScript = (scriptName: string, args?: string[]) =>
  exec.exec(path.join(path.dirname(__filename), scriptName), args);

const cacheConfig = (cachePath: string, key: string) => ({
  path: cachePath,
  key: core.getInput(key),
  isHit: () => core.getState(key) === 'true',
  restore: async () => {
    const cached = await cache.restoreCache([cachePath], key);
    const result = cached === undefined ? 'false' : 'true';
    core.saveState(key, result);
    return result;
  },
  save: () => cache.saveCache([cachePath], key),
});

export const nixCache = cacheConfig('/tmp/nixcache', 'nix-store-cache-key');
export const pnpmCache = cacheConfig('~/.local/share/pnpm/store', 'pnpm-store-cache-key');
