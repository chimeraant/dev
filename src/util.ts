import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as glob from '@actions/glob';
import * as path from 'path';

export const execScript = (scriptName: string, args?: string[], execOptions?: exec.ExecOptions) =>
  exec.exec(path.join(path.dirname(__filename), scriptName), args, execOptions);

const nonEmptyStrOrElse = async (str: string, defaultStr: string) =>
  str !== '' ? str : defaultStr;

const cacheConfig = async (
  cachePath: string,
  keyInput: string,
  pattern: string,
  restoreKeyInput: string,
  defaultRestoreKeyInput: string,
  stateId: string
) => {
  const defaultKeyInput = defaultRestoreKeyInput + (await glob.hashFiles(pattern, undefined, true));
  const saveKey = await nonEmptyStrOrElse(core.getInput(keyInput), defaultKeyInput);
  const restoreKeys = await nonEmptyStrOrElse(
    core.getInput(restoreKeyInput),
    defaultRestoreKeyInput
  );
  return {
    path: cachePath,
    key: saveKey,
    shouldSave: () => {
      const restoredKey = core.getState(stateId);
      return saveKey !== restoredKey;
    },
    restore: async () => {
      const restoredKey = await cache.restoreCache([cachePath], saveKey, restoreKeys.split('/n'));
      core.saveState(stateId, restoredKey);
      return restoredKey;
    },
    save: () => cache.saveCache([cachePath], saveKey),
  };
};

export const getNixCache = () =>
  cacheConfig(
    '/tmp/nixcache',
    'nix-store-cache-key',
    'flake.nix\nflake.lock',
    'nix-store-cache-restore-keys',
    `${process.env['RUNNER_OS']}-nix-store-`,
    'nix-cache-state'
  );

export const getPnpmCache = () =>
  cacheConfig(
    `${process.env['HOME']}/.local/share/pnpm/store/v3`,
    'pnpm-store-cache-key',
    '**!(.direnv)/pnpm-lock.yaml',
    'pnpm-store-cache-restore-keys',
    `${process.env['RUNNER_OS']}-pnpm-store-`,
    'nix-cache-state'
  );

const direnvVersion = 'v2.32.1';

export const direnv = {
  installBinDir: '/usr/local/bin',
  cacheKey: `${process.env['RUNNER_OS']}-direnv-${direnvVersion}`,
  stateKey: 'direnv-state-key',
  version: direnvVersion,
};
