import * as core from '@actions/core';

import { execScript, nixCache, pnpmCache } from './util';

const run = async () => {
  try {
    // https://github.com/cachix/install-nix-action/blob/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh#L84-L85
    core.addPath('/nix/var/nix/profiles/default/bin');

    const [isNixCacheHit] = await Promise.all([
      nixCache.restore(),
      pnpmCache.restore(),
      execScript('install.sh'),
    ]);

    if (isNixCacheHit === 'true') {
      await execScript('import.sh', [nixCache.path]);
    }
    await execScript('direnv-setup.sh');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
};

run();
