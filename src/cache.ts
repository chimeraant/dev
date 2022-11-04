import * as cache from '@actions/cache';
import { DownloadOptions } from '@actions/cache/lib/options';
import * as core from '@actions/core';
import * as glob from '@actions/glob';

import { timeDone, timeStart } from './time';

const saveCacheState = (stateId: string, restoredKey: string | undefined) => {
  core.saveState(stateId, restoredKey);
  const isCacheExists = restoredKey !== undefined;
  return isCacheExists;
};

export type Cache = {
  path: string[];
  patterns?: string[];
  key: string;
};

const hashPatters = async (conf: Cache) =>
  conf.patterns === undefined
    ? ''
    : `-${await glob.hashFiles(conf.patterns.join('\n'), undefined, false)}`;

const restoreKey = ({ key }: Cache) => `${process.env['RUNNER_OS']}-${key}`;

const getSaveKey = async (conf: Cache) => `${restoreKey(conf)}${await hashPatters(conf)}`;

export const restoreCache = async (conf: Cache, opts?: DownloadOptions) => {
  timeStart(`restore cache "${conf.key}"`);

  const saveKey = await getSaveKey(conf);
  const restoredKey = await cache.restoreCache(conf.path, saveKey, [restoreKey(conf)], opts);
  const result = saveCacheState(conf.key, restoredKey);

  timeDone(`restore cache "${conf.key}"`);
  return result;
};

export const cacheCleanup = async (
  conf: Cache,
  hooks?: { runBeforeSave?: () => Promise<unknown> }
) => {
  timeStart(`should save cache "${conf.key}"`);
  const restoredKey = core.getState(conf.key);
  const saveKey = await getSaveKey(conf);
  const isShouldSave = saveKey !== restoredKey;
  timeDone(`should save cache "${conf.key}"`);

  if (isShouldSave) {
    await hooks?.runBeforeSave?.();
    timeStart(`save cache "${conf.key}"`);
    await cache.saveCache(conf.path, saveKey);
    timeDone(`save cache "${conf.key}"`);
  }

  return isShouldSave;
};

export const nixCache: Cache = {
  path: ['/nix/store/', '/nix/var/nix/db/db.sqlite'],
  patterns: ['flake.nix', 'flake.lock'],
  key: 'nix-store',
};

export const pnpmCache: Cache = {
  path: ['~/.local/share/pnpm/store/v3'],
  patterns: ['*/pnpm-lock.yaml', 'pnpm-lock.yaml'],
  key: 'pnpm-store',
};

export const direnvCache: Cache = {
  path: ['/usr/local/bin/direnv'],
  key: 'direnv-v2.32.1',
};
