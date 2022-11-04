import * as core from '@actions/core';
import * as exec from '@actions/exec';

import { timeDone, timeStart } from './time';

export const prettyExec = async (command: string, args?: string[]) => {
  const cmdStr = `${command}${['', ...(args ?? [])].join(' ')}`;
  timeStart(cmdStr);
  const buffers: string[] = [];
  const output = await exec.getExecOutput(command, args, {
    silent: true,
    ignoreReturnCode: true,
    listeners: {
      stdline: (s) => {
        buffers.push(`${cmdStr} > stdout > ${s}`);
      },
      stderr: (s) => {
        buffers.push(`${cmdStr} > stderr > ${s}`);
      },
    },
  });
  const code = output.exitCode === 0 ? '' : ` exit code: ${output.exitCode}`;
  timeDone(cmdStr);
  core.startGroup(cmdStr);
  buffers.forEach(core.info);
  core.endGroup();
  if (output.exitCode !== 0) {
    throw Error(`Error: The process "${cmdStr}" failed with exit code: ${code}`);
  }
  return output;
};
