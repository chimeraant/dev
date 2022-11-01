import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'

import {c} from './constants'

const run = async () => {
  try {
    core.info(`cache hit? :${core.getState(c.isNixStoreCacheHitStateKey)}`)
    if (core.getState(c.isNixStoreCacheHitStateKey) !== 'true') {
      await exec.exec('nix-store --optimize')
      await exec.exec(`find /nix/store`)
      await exec.exec(`find /nix/store -name '*-*'`)
      await exec.exec(`find /nix/store -maxdepth 1`)
      await exec.exec(`find /nix/store -maxdepth 1 -name '*-*'`)

      await exec.exec(
        `nix-store --export $(find /nix/store -maxdepth 1 -name '*-*') > ${c.nixCachePath}`
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
