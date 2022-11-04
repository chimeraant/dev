import * as core from '@actions/core';
import * as exec from '@actions/exec';

export const prettyExec = async (command: string, args?: string[], option?: exec.ExecOptions) => {
  const start = process.hrtime();
  const output = await exec.getExecOutput(command, args, {
    silent: true,
    ...option,
  });
  const elapsed = process.hrtime(start)[1] / 100000;
  core.startGroup(`"${command} ${args?.join(' ')}" ${elapsed}s code: ${output.exitCode}`);
  core.error(output.stderr);
  core.info(output.stdout);
  core.endGroup();
  return output;
};
