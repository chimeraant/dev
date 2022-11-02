import * as cache from '@actions/cache';
import * as core from '@actions/core';

import { cacheHitState, cacheKey, cachePath, execScript } from './util';

const run = async () => {
  try {
    if (cacheHitState.get() !== 'hit') {
      await execScript('export.sh', [cachePath]);
      await cache.saveCache([cachePath], cacheKey);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
};

run();
