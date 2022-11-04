import * as core from '@actions/core';
import * as exec from '@actions/exec';

const exportVariables = async () => {
  let outputBuffer = '';
  await exec.exec('direnv', ['export', 'json'], {
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

const allow = () => exec.exec('direnv', ['allow']);

export const setup = async () => {
  await exportVariables();
  await allow();
};
