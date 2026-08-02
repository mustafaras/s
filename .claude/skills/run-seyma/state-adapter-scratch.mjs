// state-adapter-scratch.mjs — L2/B3 design-only dependency-bag adapter.
//
// This module is intentionally outside the production script graph. It does
// not import app.js, expose migrate(), write storage, call sync, or perform
// network I/O. Its only job is to make the future state-module contract
// executable in a scratch harness before any runtime extraction is attempted.

export const STATE_ADAPTER_CONTRACT_VERSION = 1;

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function defaultUidFactory() {
  let sequence = 0;
  return (prefix = 'id') => `${prefix}_scratch_${++sequence}`;
}

function noop() {}

/**
 * Build the only ambient values a future state helper may receive.
 *
 * The bag is frozen at the boundary. Nested catalogs are cloned so a helper
 * cannot mutate the caller's fixture through a shared reference.
 */
export function createStateDependencyBag(overrides = {}) {
  const source = overrides && typeof overrides === 'object' ? overrides : {};
  const uid = typeof source.uid === 'function' ? source.uid : defaultUidFactory();
  const now = typeof source.now === 'function' ? source.now : () => new Date().toISOString();
  const logger = typeof source.logger === 'function' ? source.logger : noop;
  const catalogs = clone(source.catalogs && typeof source.catalogs === 'object' ? source.catalogs : {});
  const featureMigrations = clone(source.featureMigrations && typeof source.featureMigrations === 'object' ? source.featureMigrations : {});
  return Object.freeze({
    contractVersion: STATE_ADAPTER_CONTRACT_VERSION,
    now,
    uid,
    catalogs: Object.freeze(catalogs),
    featureMigrations: Object.freeze(featureMigrations),
    logger,
  });
}

/**
 * Invoke a dependency-bag-aware helper against a deep clone.
 *
 * The result is deliberately diagnostic rather than an app API: it gives the
 * scratch harness the original/working snapshots needed to prove that the
 * caller's fixture was not mutated at the adapter boundary.
 */
export function invokeStateHelperScratch(helper, input, overrides = {}) {
  if (typeof helper !== 'function') throw new TypeError('helper must be a function');
  const original = clone(input);
  const working = clone(input);
  const deps = createStateDependencyBag(overrides);
  const result = helper(working, deps);
  return { original, working, result, deps };
}

/**
 * Future integration shape only. This wrapper is not wired to app.js.
 */
export function createStateHelperAdapterScratch(helper, overrides = {}) {
  if (typeof helper !== 'function') throw new TypeError('helper must be a function');
  const deps = createStateDependencyBag(overrides);
  return function adaptedStateHelper(input) {
    const working = clone(input);
    return helper(working, deps);
  };
}
