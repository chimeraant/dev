import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'

import {c} from './constants'

const run = async () => {
  try {
    if (
      core.getState(c.isSuccessStateKey) === 'true' &&
      core.getState(c.isNixStoreCacheHitStateKey) !== 'true'
    ) {
      await exec.exec('nix-store --optimize')
      await exec.exec(
        "nix-store --export $(find /nix/store -maxdepth 1 -name '*-*') > /tmp/nixcache"
      )
      await cache.saveCache([c.nixCachePath], core.getState(c.nixStoreKeyStateKey))
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
