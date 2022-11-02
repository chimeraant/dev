import * as cache from '@actions/cache';
import * as core from '@actions/core';

import { cacheHitState, cacheKey, cachePath, execScript } from './util';

const run = async () => {
  try {
    // https://github.com/cachix/install-nix-action/blob/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh#L84-L85
    core.addPath('/nix/var/nix/profiles/default/bin');

    const [cached] = await Promise.all([
      cache.restoreCache([cachePath], cacheKey),
      execScript('install.sh'),
    ]);

    if (cached) {
      cacheHitState.save('hit');
      await execScript('import.sh', [cachePath]);
    }
    await execScript('direnv-setup.sh');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
};

run();
