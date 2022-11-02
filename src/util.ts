import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';

export const execScript = (scriptName: string, args?: string[]) =>
  exec.exec(path.join(path.dirname(__filename), scriptName), args);

export const cachePath = '/tmp/nixcache';

export const cacheKey = core.getInput('nix-store-key');

const isCacheHitKey = 'isCacheHit';

export const cacheHitState = {
  get: () => core.getState(isCacheHitKey),
  save: (val: string) => core.saveState(isCacheHitKey, val),
};
