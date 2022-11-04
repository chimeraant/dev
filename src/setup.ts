import * as core from '@actions/core';

import { direnvCache, nixCache, pnpmCache, restoreCache } from './cache';
import { prettyExec } from './exec';

const restoreNixCache = async () => {
  await prettyExec('sudo', ['mkdir', '-p', '--verbose', '/nix']);
  await prettyExec('sudo', ['chown', '--verbose', `${process.env['USER']}:`, '/nix']);
  const [nixCacheExists] = await Promise.all([restoreCache(nixCache), restoreCache(direnvCache)]);
  if (!nixCacheExists) {
    await prettyExec('sudo', ['rm', '-rf', '/nix']);
    await prettyExec(`${__dirname}/../install.sh`);
  }
};

export const setup = async () => {
  // https://github.com/cachix/install-nix-action/blob/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh#L84-L85
  core.addPath(`/nix/var/nix/profiles/default/bin`);
  core.addPath(`/run/current-system/sw/bin`);
  await Promise.all([restoreNixCache(), restoreCache(pnpmCache)]);
  await prettyExec('direnv', ['allow']);
  const { stdout } = await prettyExec('direnv', ['export', 'json']);
  Object.entries(JSON.parse(stdout)).forEach(([key, value]) => core.exportVariable(key, value));
};
