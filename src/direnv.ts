import * as core from '@actions/core';

import { prettyExec } from './exec';

const exportVariables = async () => {
  const { stdout } = await prettyExec('direnv', ['export', 'json']);
  Object.entries(JSON.parse(stdout)).forEach(([key, value]) => core.exportVariable(key, value));
};

export const setup = async () => {
  await prettyExec('nix', ['develop']);
  await prettyExec('direnv', ['allow']);
  await exportVariables();
};
