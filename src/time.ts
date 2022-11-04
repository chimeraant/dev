import * as core from '@actions/core';

export const timeStart = (name: string) => {
  core.info(`##[start] ${name}`);
  console.time(`##[end] ${name}`);
};

export const timeDone = (name: string) => console.timeEnd(`##[end] ${name}`);
