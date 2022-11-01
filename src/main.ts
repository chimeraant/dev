import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as path from 'path'

export const c = {
  nixCachePath: '/tmp/nixcache',
  nixVersion: '2.11.0',
  direnvVersion: '2.32.1',
  nixInstallScriptUrl:
    'https://raw.githubusercontent.com/cachix/install-nix-action/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh',
  isNixStoreCacheHitStateKey: 'isNixStoreCacheHit',
  nixStoreKeyStateKey: 'nixStoreKey'
}

const prepareNix = async () => {
  const nixStoreKey = core.getInput('nix_store_key', {required: true})
  const [nixCache] = await Promise.all([
    cache.restoreCache([c.nixCachePath], nixStoreKey),
    exec.exec(`curl -sfL ${c.nixInstallScriptUrl} | bash`, [], {
      env: {INPUT_INSTALL_URL: `https://releases.nixos.org/nix/nix-${c.nixVersion}/install`}
    })
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
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
