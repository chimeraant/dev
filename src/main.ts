import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as glob from '@actions/glob';
import * as path from 'path';

const nonEmptyStrOrElse = async (str: string, defaultStr: string) =>
  str !== '' ? str : defaultStr;

const cacheConfig = async (
  cachePath: string,
  keyInput: string,
  pattern: string[],
  restoreKeyInput: string,
  defaultRestoreKeyInput: string,
  stateId: string
) => {
  const defaultKeyInput =
    defaultRestoreKeyInput + (await glob.hashFiles(pattern.join('\n'), undefined, true));
  const saveKey = await nonEmptyStrOrElse(core.getInput(keyInput), defaultKeyInput);
  const restoreKeys = await nonEmptyStrOrElse(
    core.getInput(restoreKeyInput),
    defaultRestoreKeyInput
  );
  return {
    path: cachePath,
    key: saveKey,
    shouldSave: () => {
      const restoredKey = core.getState(stateId);
      return saveKey !== restoredKey;
    },
    restore: async () => {
      const restoredKey = await cache.restoreCache([cachePath], saveKey, restoreKeys.split('/n'));
      core.saveState(stateId, restoredKey);
      return restoredKey;
    },
    save: () => cache.saveCache([cachePath], saveKey),
  };
};

const getNixCache = () =>
  cacheConfig(
    '/tmp/nixcache',
    'nix-store-cache-key',
    ['flake.nix', 'flake.lock'],
    'nix-store-cache-restore-keys',
    `${process.env['RUNNER_OS']}-nix-store-`,
    'nix-cache-state'
  );

const getPnpmCache = () =>
  cacheConfig(
    `${process.env['HOME']}/.local/share/pnpm/store/v3`,
    'pnpm-store-cache-key',
    ['**/pnpm-lock.yaml', '!.direnv/**'],
    'pnpm-store-cache-restore-keys',
    `${process.env['RUNNER_OS']}-pnpm-store-`,
    'nix-cache-state'
  );

const direnvVersion = 'v2.32.1';

const direnv = {
  installBinDir: '/usr/local/bin',
  cacheKey: `${process.env['RUNNER_OS']}-direnv-${direnvVersion}`,
  stateKey: 'direnv-state-key',
  version: direnvVersion,
};

const restoreDirenvCache = async () => {
  const restoredKey = await cache.restoreCache([`${direnv.installBinDir}/direnv`], direnv.cacheKey);
  const isDirenvCacheHit = `${restoredKey !== undefined}`;
  core.saveState(direnv.stateKey, isDirenvCacheHit);
};

const installNixAndDirenv = async () => {
  await restoreDirenvCache();
  await exec.exec(`${path.dirname(__filename)}/../install.sh`, [], {
    env: {
      ...process.env,
      direnv_bin_path: direnv.installBinDir,
      direnv_version: direnv.version,
    },
  });
};

const setupNixCache = async () => {
  const nixCache = await getNixCache();
  const restoredCacheKey = await nixCache.restore();
  return [nixCache.path, restoredCacheKey] as const;
};

const direnvExport = async () => {
  let outputBuffer = '';
  await exec.exec('direnv', ['export', 'json'], {
    listeners: {
      stdout: (data) => {
        outputBuffer += data.toString();
      },
    },
  });
  Object.entries(JSON.parse(outputBuffer)).forEach(([key, value]) =>
    core.exportVariable(key, value)
  );
};

const devShellPath = './#devShell.x86_64-linux';

const setupNixDirenv = async () => {
  const [[nixCachePath, restoredNixStoreCacheKey]] = await Promise.all([
    setupNixCache(),
    installNixAndDirenv(),
  ]);

  const nixStoreCacheExists = restoredNixStoreCacheKey !== undefined;
  if (nixStoreCacheExists) {
    await exec.exec('nix', ['copy', devShellPath, '--from', nixCachePath, '--no-check-sigs']);
  }
};

const pnpmRestore = async () => {
  const pnpmCache = await getPnpmCache();
  await pnpmCache.restore();
};

const saveNixStore = async () => {
  const nixCache = await getNixCache();
  if (nixCache.shouldSave()) {
    await exec.exec('nix', ['store', 'gc']);
    await exec.exec('nix', ['store', 'optimise']);
    await exec.exec('nix', ['copy', devShellPath, '--to', nixCache.path, '--no-check-sigs']);
    await nixCache.save();
  }
};

const savePnpmStore = async () => {
  const pnpmCache = await getPnpmCache();
  if (pnpmCache.shouldSave()) {
    await exec.exec('pnpm', ['store', 'prune']);
    await pnpmCache.save();
  }
};

const saveDirenvCache = async () => {
  const isCacheHit = core.getState(direnv.stateKey);
  if (isCacheHit === 'false') {
    await cache.saveCache([`${direnv.installBinDir}/direnv`], direnv.cacheKey);
  }
};

const setup = async () => {
  // https://github.com/cachix/install-nix-action/blob/11f4ad19be46fd34c005a2864996d8f197fb51c6/install-nix.sh#L84-L85
  core.addPath('/nix/var/nix/profiles/default/bin');

  await Promise.all([setupNixDirenv(), pnpmRestore()]);
  await exec.exec('direnv', ['allow']);
  await direnvExport();
};

const cleanup = async () => {
  await Promise.all([saveNixStore(), savePnpmStore(), saveDirenvCache()]);
};

const run = async () => {
  try {
    if (core.getState('is_post') === 'true') {
      return await cleanup();
    }
    core.saveState('is_post', 'true');
    return await setup();
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
};

run();
