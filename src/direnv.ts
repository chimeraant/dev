import * as core from '@actions/core';
import * as exec from '@actions/exec';

import { prettyExec } from './exec';

const exportVariables = async () => {
  const { stdout } = await exec.getExecOutput('direnv', ['export', 'json']);
  Object.entries(JSON.parse(stdout)).forEach(([key, value]) => core.exportVariable(key, value));
};

export const setup = async () => {
  await prettyExec('direnv', ['allow']);
  await exportVariables();
};
