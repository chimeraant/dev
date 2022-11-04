import * as core from '@actions/core';
import * as exec from '@actions/exec';

export const prettyExec = async (command: string, args?: string[], option?: exec.ExecOptions) => {
  const start = process.hrtime();
  const output = await exec.getExecOutput(command, args, {
    silent: true,
    ...option,
  });
  const elapsed = process.hrtime(start)[1] / 1000000000;
  core.startGroup(`${command} ${args?.join(' ')} exits with code ${output.exitCode} (${elapsed}s)`);
  core.error(output.stderr);
  core.info(output.stdout);
  core.endGroup();
  return output;
};
