import * as core from '@actions/core';
import * as exec from '@actions/exec';

export const prettyExec = async (command: string, args?: string[], option?: exec.ExecOptions) => {
  const cmdStr = `${command} ${args?.join(' ') ?? ''}`;
  core.info(`>>> Start: "${cmdStr}"`);
  const start = performance.now();
  const output = await exec.getExecOutput(command, args, {
    silent: true,
    ignoreReturnCode: true,
    ...option,
  });
  const end = performance.now();
  const elapsed = ((end - start) / 1000).toFixed(0);
  const code = output.exitCode === 0 ? '' : ` exit code: ${output.exitCode}`;
  core.info(`\n>>> Done: "${cmdStr}" (${elapsed}s)`);
  core.startGroup(`stderr`);
  core.info(output.stderr);
  core.endGroup();
  core.startGroup(`stdout`);
  core.info(output.stdout);
  core.endGroup();
  core.info('\n');
  if (output.exitCode !== 0) {
    throw Error(`Error: The process "${cmdStr}" failed with exit code: ${code}`);
  }
  return output;
};
