import * as core from '@actions/core';
import * as p from 'path';

import {
  direnvCache,
  nixCache,
  nixInstallerCache,
  pnpmCache,
  projectCache,
  restoreCache,
} from './cache';
import * as DIRENV from './direnv';
import { prettyExec } from './exec';
import * as NIX_STORE from './nix-store';

const install = async () => {
  await Promise.all([restoreCache(direnvCache), restoreCache(nixInstallerCache)]);
  await prettyExec(`${p.dirname(__filename)}/../install.sh`);
};

const setupNixDirenv = async () => {
  const [nixCacheExists] = await Promise.all([restoreCache(nixCache), install()]);

  if (nixCacheExists) {
    await NIX_STORE.importFrom(nixCache.path);
  }
};

export const setup = async () => {
  // https://github.com/cachix/install-nix-action/blob/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh#L84-L85
  core.addPath(`/nix/var/nix/profiles/per-user/${process.env['USER']}/profile/bin`);
  await Promise.all([setupNixDirenv(), restoreCache(projectCache), restoreCache(pnpmCache)]);
  await DIRENV.setup();
};
