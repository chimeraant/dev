import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as path from 'path'

import {c} from './constants'

const run = async () => {
  try {
    const nixStoreKey = core.getInput('nix_store_key', {required: true})

    // const [nixCache] = await Promise.all([cache.restoreCache([c.nixCachePath], nixStoreKey)])
    // const isNixStoreCacheHit = nixCache !== undefined
    const isNixStoreCacheHit = false

    // await exec.exec(path.join(path.dirname(__filename), 'install-nix.sh'), [], {
    //   env: {...process.env, NIX_VERSION: c.nixVersion}
    // })

    // if (isNixStoreCacheHit) {
    //   core.info(`cache hit! key : ${nixStoreKey}`)
    //   core.info(`cache hit! value : ${nixCache}`)
    //   await exec.exec(`nix-store --import < ${c.nixCachePath}`)
    // }

    core.saveState(c.isNixStoreCacheHitStateKey, `${isNixStoreCacheHit}`)
    core.saveState(c.nixStoreKeyStateKey, nixStoreKey)
    await exec.exec(path.join(path.dirname(__filename), 'install-direnv.sh'), [], {
      env: {DIRENV_VERSION: c.direnvVersion}
    })
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
