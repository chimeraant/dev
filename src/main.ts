import * as core from '@actions/core';

import { cleanup } from './cleanup';
import { setup } from './direnv';

const run = async () => {
  try {
    if (core.getState('is_post') === 'true') {
      return await cleanup();
    }
    core.saveState('is_post', 'true');
    return await setup();
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error);
    }
  }
};

run();
