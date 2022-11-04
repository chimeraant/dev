import * as core from '@actions/core';

import { prettyExec } from './exec';

const exportVariables = async () => {
  const { stdout } = await prettyExec('direnv', ['export', 'json']);
  Object.entries(JSON.parse(stdout)).forEach(([key, value]) => core.exportVariable(key, value));
};

const allow = () => prettyExec('direnv', ['allow']);

export const setup = async () => {
  await allow();
  await exportVariables();
};
