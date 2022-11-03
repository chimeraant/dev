import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as glob from '@actions/glob';
import * as path from 'path';

export const execScript = (scriptName: string, args?: string[]) =>
  exec.exec(path.join(path.dirname(__filename), scriptName), args);

const nonEmptyStrOrElse = async (str: string, defaultStr: () => Promise<string>) =>
  str !== '' ? str : await defaultStr();

const nonEmptyArrOrElse = (arr: string[], defaultArr: string[]) =>
  arr.length > 0 ? arr : defaultArr;

const cacheConfig = async (
  cachePath: string,
  keyInput: string,
  defaultKeyInput: () => Promise<string>,
  restoreKeyInput: string,
  defaultRestoreKeyInput: string[]
) => {
  const cacheStateId = keyInput;
  const saveKey = await nonEmptyStrOrElse(core.getInput(keyInput), defaultKeyInput);
  const restoreKeys = nonEmptyArrOrElse(
    core.getInput(restoreKeyInput).split('\n'),
    defaultRestoreKeyInput
  );
  return {
    path: cachePath,
    key: saveKey,
    shouldSave: () => {
      const restoredKey = core.getState(`${cacheStateId}-restored-key`);
      const isShouldSave = saveKey !== restoredKey;
      core.info(
        `Cache should save: ${JSON.stringify({ cacheStateId, restoredKey, saveKey, isShouldSave })}`
      );
      return isShouldSave;
    },
    restore: async () => {
      const restoredKey = await cache.restoreCache([cachePath], saveKey, restoreKeys);
      core.info(
        `Cache restored: ${JSON.stringify({ cachePath, saveKey, restoreKeys, restoredKey })}`
      );
      core.saveState(`${cacheStateId}-restored-key`, restoredKey);
      return restoredKey;
    },
    save: () => cache.saveCache([cachePath], saveKey),
  };
};

const nixStoreCacheKeyPrefix = `${process.env['RUNNER_OS']}-nix-store-`;

const logAndHash = async (pattern: string) => {
  const globber = await glob.create(pattern);
  const files = [];
  for await (const file of globber.globGenerator()) {
    files.push(file);
  }
  const hash = await glob.hashFiles(pattern, undefined, true);
  core.info(`hashing files: ${files} => ${hash}`);
  return hash;
};

export const getNixCache = () =>
  cacheConfig(
    '/tmp/nixcache',
    'nix-store-cache-key',
    async () => {
      const hash = await logAndHash('flake.nix\nflake.lock');
      return `${nixStoreCacheKeyPrefix}${hash}`;
    },
    'nix-store-cache-restore-keys',
    [nixStoreCacheKeyPrefix]
  );

const pnpmStoreCacheKeyPrefix = `${process.env['RUNNER_OS']}-pnpm-store-`;

export const getPnpmCache = () =>
  cacheConfig(
    '~/.local/share/pnpm/store/v3',
    'pnpm-store-cache-key',
    async () => {
      const hash = await logAndHash('**/pnpm-lock.yaml');
      return `${pnpmStoreCacheKeyPrefix}${hash}`;
    },
    'pnpm-store-cache-restore-keys',
    [pnpmStoreCacheKeyPrefix]
  );
