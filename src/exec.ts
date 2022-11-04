import * as core from '@actions/core';
import * as exec from '@actions/exec';

export const prettyExec = async (command: string, args?: string[], option?: exec.ExecOptions) => {
  const cmdStr = `${command} ${args?.join(' ') ?? ''}`;
  const mark = `>>> "${cmdStr}"`;
  console.time(mark);
  const buffers: string[] = [];
  const output = await exec.getExecOutput(command, args, {
    silent: true,
    ignoreReturnCode: true,
    listeners: {
      stdline: (s) => {
        core.info(`${mark} [stdout] ${s}`);
        buffers.push(`[stdout] ${s}`);
      },
      stderr: (s) => {
        core.info(`${mark} [stderr] ${s}`);
        buffers.push(`[stderr] ${s}`);
      },
    },
    ...option,
  });
  const code = output.exitCode === 0 ? '' : ` exit code: ${output.exitCode}`;
  console.timeEnd(mark);
  core.startGroup(mark);
  buffers.forEach(core.info);
  core.endGroup();
  if (output.exitCode !== 0) {
    throw Error(`Error: The process "${cmdStr}" failed with exit code: ${code}`);
  }
  return output;
};
