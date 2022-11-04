import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

import { direnv, getPnpmCache } from './util';

const restoreNixStore = async () => {
  // const nixCache = await getNixCache();
  // if (nixCache.shouldSave()) {
  //   await execScript('export.sh', [nixCache.path]);
  //   await nixCache.save();
  // }
};

const restorePnpmStore = async () => {
  const pnpmCache = await getPnpmCache();
  if (pnpmCache.shouldSave()) {
    await exec.exec('pnpm store prune');
    await pnpmCache.save();
  }
};

const restoreDirenvCache = async () => {
  const isCacheHit = core.getState(direnv.stateKey);
  if (isCacheHit === 'false') {
    await cache.saveCache([`${direnv.installBinDir}/direnv`], direnv.cacheKey);
  }
};

const run = async () => {
  try {
    await Promise.all([restoreNixStore(), restorePnpmStore(), restoreDirenvCache()]);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
};

run();
