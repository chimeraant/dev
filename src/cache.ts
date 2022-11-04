import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as glob from '@actions/glob';

const saveCacheState = (stateId: string, restoredKey: string | undefined) => {
  core.saveState(stateId, restoredKey);
  const isCacheExists = restoredKey !== undefined;
  return isCacheExists;
};

export type Cache = {
  path: string;
  patterns?: string[];
  key: string;
};

const hashPatters = async (conf: Cache) =>
  conf.patterns === undefined
    ? ''
    : `-${await glob.hashFiles(conf.patterns.join('\n'), undefined, false)}`;

const getSaveKey = async (conf: Cache) =>
  `${process.env['RUNNER_OS']}-${conf.key}${await hashPatters(conf)}`;

export const restoreCache = async (conf: Cache) => {
  console.time(`>>> restore cache "${conf.key}"`);

  const saveKey = await getSaveKey(conf);
  const restoredKey = await cache.restoreCache([conf.path], saveKey, [conf.key]);
  const result = saveCacheState(conf.key, restoredKey);

  console.timeEnd(`>>> restore cache "${conf.key}"`);
  return result;
};

export const cacheCleanup = async (
  conf: Cache,
  hooks?: { runBeforeSave?: () => Promise<unknown> }
) => {
  console.time(`>>> should save cache "${conf.key}"`);
  const restoredKey = core.getState(conf.key);
  const saveKey = await getSaveKey(conf);
  const isShouldSave = saveKey !== restoredKey;
  console.timeEnd(`>>> should save cache "${conf.key}"`);

  if (isShouldSave) {
    await hooks?.runBeforeSave?.();
    console.time(`>>> save cache "${conf.key}"`);
    await cache.saveCache([conf.path], saveKey);
    console.timeEnd(`>>> save cache "${conf.key}"`);
  }

  return isShouldSave;
};

export const nixCache: Cache = {
  path: '/tmp/nixcache',
  patterns: ['flake.nix', 'flake.lock'],
  key: 'nix-store',
};

export const pnpmCache: Cache = {
  path: `~/.local/share/pnpm/store/v3`,
  patterns: ['*/pnpm-lock.yaml', 'pnpm-lock.yaml'],
  key: 'pnpm-store',
};

export const direnvCache: Cache = {
  path: `/usr/local/bin/direnv`,
  key: 'direnv-v2.32.1',
};

export const projectCache: Cache = {
  path: `${process.env['GITHUB_WORKSPACE']}/.direnv`,
  patterns: ['flake.nix', 'flake.lock', '*/pnpm-lock.yaml', 'pnpm-lock.yaml'],
  key: 'project',
};
