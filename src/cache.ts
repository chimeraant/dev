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
    : `-${await glob.hashFiles(conf.patterns.join('\n'), undefined, true)}`;

const getSaveKey = async (conf: Cache) =>
  `${process.env['RUNNER_OS']}-${conf.key}${await hashPatters(conf)}`;

export const restoreCache = async (conf: Cache) => {
  const saveKey = await getSaveKey(conf);
  const restoredKey = await cache.restoreCache([conf.path], saveKey, [conf.key]);
  return saveCacheState(conf.key, restoredKey);
};

export const shouldSaveCache = async (conf: Cache) => {
  const restoredKey = core.getState(conf.key);
  const saveKey = await getSaveKey(conf);
  return saveKey !== restoredKey;
};

export const saveCache = async (conf: Cache) => {
  const saveKey = await getSaveKey(conf);
  cache.saveCache([conf.path], saveKey);
};

export const nixCache: Cache = {
  path: '/tmp/nixcache',
  patterns: ['flake.nix', 'flake.lock'],
  key: 'nix-store',
};

export const pnpmCache: Cache = {
  path: `~/.local/share/pnpm/store/v3`,
  patterns: ['**/pnpm-lock.yaml', '!.direnv/**'],
  key: 'pnpm-store',
};

export const direnvCache: Cache = {
  path: `/usr/local/bin/direnv`,
  key: 'direnv-v2.32.1',
};

export const projectCache: Cache = {
  path: `${process.env['GITHUB_WORKSPACE']}/.direnv`,
  patterns: ['flake.nix', 'flake.lock', '**/pnpm-lock.yaml', '!.direnv/**'],
  key: 'project',
};

export const experimentalCache: Cache = {
  path: `/nix`,
  patterns: ['flake.nix', 'flake.lock'],
  key: 'experimental',
};
