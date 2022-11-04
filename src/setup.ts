import * as core from '@actions/core';

import { direnvCache, pnpmCache, projectCache, restoreCache, ultraCache } from './cache';
import * as DIRENV from './direnv';
import { prettyExec } from './exec';
// import * as NIX_STORE from './nix-store';

export const install = async () => {
  await restoreCache(direnvCache);
  await prettyExec(`${__dirname}/../install.sh`);
};

const setupNixDirenv = async () => {
  await prettyExec('sudo', ['mkdir', '-p', '--verbose', '/nix']);
  await prettyExec('sudo', ['chown', '--verbose', `${process.env['USER']}:`, '/nix']);
  const ultraCacheExists = await restoreCache(ultraCache);
  if (!ultraCacheExists) {
    await prettyExec('sudo', ['rm', '-rf', '/nix']);
    return await install();
  }
  // const [nixCacheExists] = await Promise.all([
  //   restoreCache(nixCache),
  //   install(),
  // ]);
  // if (nixCacheExists) {
  //   await NIX_STORE.importFrom(nixCache.path);
  // }
};

export const setup = async () => {
  // https://github.com/cachix/install-nix-action/blob/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh#L84-L85
  core.addPath(`/nix/var/nix/profiles/default/bin`);
  await Promise.all([setupNixDirenv(), restoreCache(projectCache), restoreCache(pnpmCache)]);
  await DIRENV.setup();
};
