import * as core from '@actions/core';
import * as glob from '@actions/glob';
import * as path from 'path';

import { direnvCache, nixCache, pnpmCache, restoreCache } from './cache';
import { prettyExec } from './exec';

const restoreNixCache = async () => {
  await prettyExec('sudo', ['mkdir', '-p', '--verbose', '/nix']);
  await prettyExec('sudo', ['chown', '--verbose', `${process.env['USER']}:`, '/nix']);
  await Promise.all([restoreCache(nixCache), restoreCache(direnvCache)]);
  await prettyExec(`${__dirname}/install.sh`);
};

export const setup = async () => {
  // https://github.com/cachix/install-nix-action/blob/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh#L84-L85
  core.addPath(`/nix/var/nix/profiles/default/bin`);
  core.addPath(`/nix/var/nix/profiles/per-user/${process.env['USER']}/profile/bin`);
  core.addPath(`/run/current-system/sw/bin`);
  await Promise.all([restoreNixCache(), restoreCache(pnpmCache)]);

  const globber = await glob.create('**/.envrc');
  const files = await globber.glob();
  for (const file of files) {
    const cwd = path.dirname(file);
    await prettyExec('direnv', ['allow'], { cwd });
    const { stdout } = await prettyExec('direnv', ['export', 'json'], { cwd });
    Object.entries(JSON.parse(stdout)).forEach(([key, value]) => core.exportVariable(key, value));
  }
};
