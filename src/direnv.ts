import * as core from '@actions/core';

import { prettyExec } from './exec';

const exportVariables = async () => {
  let outputBuffer = '';
  await prettyExec('direnv', ['export', 'json'], {
    listeners: {
      stdout: (data) => {
        outputBuffer += data.toString();
      },
    },
  });
  Object.entries(JSON.parse(outputBuffer)).forEach(([key, value]) =>
    core.exportVariable(key, value)
  );
};

const allow = () => prettyExec('direnv', ['allow']);

export const setup = async () => {
  await allow();
  await exportVariables();
};
