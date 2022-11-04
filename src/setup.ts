import * as core from '@actions/core';

import { direnvCache, nixCache, pnpmCache, projectCache, restoreCache } from './cache';
import { prettyExec } from './exec';

const restoreNixCache = async () => {
  await Promise.all([
    prettyExec('sudo', ['mkdir', '-p', '--verbose', '/nix']),
    prettyExec('sudo', ['chown', '--verbose', `${process.env['USER']}:`, '/nix']),
  ]);
  const nixCacheExists = await restoreCache(nixCache);
  if (!nixCacheExists) {
    await prettyExec('sudo', ['rm', '-rf', '/nix']);
  }
};

export const install = async () => {
  await Promise.all([restoreCache(direnvCache), restoreNixCache()]);
  await prettyExec(`${__dirname}/../install.sh`);
};

export const setup = async () => {
  // https://github.com/cachix/install-nix-action/blob/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh#L84-L85
  core.addPath(`/nix/var/nix/profiles/default/bin`);
  await Promise.all([install(), restoreCache(projectCache), restoreCache(pnpmCache)]);
  await prettyExec('direnv', ['allow']);
  const { stdout } = await prettyExec('direnv', ['export', 'json']);
  Object.entries(JSON.parse(stdout)).forEach(([key, value]) => core.exportVariable(key, value));
};
