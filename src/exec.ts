import * as core from '@actions/core';
import * as exec from '@actions/exec';

export const prettyExec = async (command: string, args?: string[], option?: exec.ExecOptions) => {
  const cmdStr = `${command} ${args?.join(' ') ?? ''}`;
  console.time(`>>> "${cmdStr}"`);
  const output = await exec.getExecOutput(command, args, {
    silent: true,
    ignoreReturnCode: true,
    ...option,
  });
  const code = output.exitCode === 0 ? '' : ` exit code: ${output.exitCode}`;
  console.timeEnd(`>>> "${cmdStr}"`);
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
