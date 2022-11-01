import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as path from 'path'

import {c} from './constants'

const prepareNix = async () => {
  const nixStoreKey = core.getInput('nix_store_key', {required: true})
  const [nixCache] = await Promise.all([
    cache.restoreCache([c.nixCachePath], nixStoreKey),
    path.join(path.dirname(__filename), 'install-direnv.sh'),
    exec.exec(`curl -sS -o "./install" -v --fail -L "${c.nixInstallScriptUrl}" `).then(() =>
      exec.exec(`./install`, [], {
        env: {INPUT_INSTALL_URL: `https://releases.nixos.org/nix/nix-${c.nixVersion}/install`}
      })
    )
  ])
  const isNixStoreCacheHit = nixCache !== undefined
  if (isNixStoreCacheHit) {
    await exec.exec('nix-store --import < /tmp/nixcache')
  }
  core.saveState(c.isNixStoreCacheHitStateKey, `${isNixStoreCacheHit}`)
  core.saveState(c.nixStoreKeyStateKey, nixStoreKey)
}

const run = async () => {
  try {
    await Promise.all([
      prepareNix(),
      exec.exec(path.join(path.dirname(__filename), 'install-direnv.sh'), [], {
        env: {DIRENV_VERSION: c.direnvVersion}
      })
    ])
    await exec.exec('direnv allow')
    await exec.exec('direnv export gha >> "$GIHUB_ENV')
    core.saveState(c.isSuccessStateKey, `${true}`)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
