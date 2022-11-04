import * as core from '@actions/core';
import * as exec from '@actions/exec';

export const prettyExec = async (command: string, args?: string[], option?: exec.ExecOptions) => {
  const start = process.hrtime();
  const output = await exec.getExecOutput(command, args, {
    silent: true,
    ...option,
  });
  const elapsed = (process.hrtime(start)[1] / 100000).toFixed(0);
  const code = output.exitCode === 0 ? '' : ` exit code: ${output.exitCode}`;
  const cmdStr = `${command} ${args?.join(' ')}`;
  core.startGroup(`"${cmdStr}" ${elapsed}s ${code}`);
  core.error(output.stderr);
  core.info(output.stdout);
  core.endGroup();
  return output;
};
