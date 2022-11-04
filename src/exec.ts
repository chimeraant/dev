import * as core from '@actions/core';
import * as exec from '@actions/exec';

export const prettyExec = async (command: string, args?: string[], option?: exec.ExecOptions) => {
  const start = performance.now();
  const output = await exec.getExecOutput(command, args, {
    silent: true,
    ...option,
  });
  const elapsed = (performance.now() - start).toFixed(0);
  const code = output.exitCode === 0 ? '' : ` exit code: ${output.exitCode}`;
  const cmdStr = `${command} ${args?.join(' ')}`;
  core.info(`\n\n>>> "${cmdStr}" (${elapsed}s) ${code}`);
  core.startGroup(`stderr`);
  core.info(output.stderr);
  core.endGroup();
  core.startGroup(`stdout`);
  core.info(output.stdout);
  core.endGroup();
  core.info('\n');
  return output;
};
