(function (root) {
  'use strict';

  // REM-50: foreground-only orchestration.  This module owns trigger
  // accounting and burst coalescing; it never owns a timer, DOM, storage,
  // network request, notification or background scheduling capability.
  var VERSION = '1';
  var DEFAULT_BURST_MS = 1000;
  var CATCH_UP_MAX_AGE_MS = 24 * 60 * 60 * 1000;
  var TRIGGER_ORDER = [
    'boot', 'foreground', 'focus', 'pageshow', 'online',
    'hidden', 'visibilitychange', 'timer', 'offline', 'manual'
  ];

  function finiteNumber(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function triggerName(value) {
    var name = String(value || 'manual');
    return TRIGGER_ORDER.indexOf(name) >= 0 ? name : 'manual';
  }

  function resultSummary(result) {
    var value = result && typeof result === 'object' ? result : {};
    return {
      ok: value.ok !== false,
      status: String(value.status || ''),
      source: String(value.source || ''),
      changed: value.changed === true,
      shownCount: Number(value.shownCount) || 0,
      nativeShownCount: Number(value.nativeShownCount) || 0,
      suppressedCount: Number(value.suppressedCount) || 0,
      duplicateCount: Number(value.duplicateCount) || 0,
      catchUpCount: Number(value.catchUpCount) || 0,
      catchUpPerformed: value.catchUpPerformed === true,
      nativeReplay: false
    };
  }

  function copyMatrix(matrix) {
    var output = {};
    Object.keys(matrix).forEach(function (key) {
      output[key] = Object.assign({}, matrix[key]);
    });
    return output;
  }

  function create(options) {
    var input = options && typeof options === 'object' ? options : {};
    var burstMs = Math.max(0, finiteNumber(input.burstMs, DEFAULT_BURST_MS));
    var now = typeof input.now === 'function' ? input.now : function () { return Date.now(); };
    var evaluate = typeof input.evaluate === 'function' ? input.evaluate : function () {
      return { ok: false, status: 'failed', reason: 'missing-evaluator', changed: false };
    };
    var matrix = {};
    TRIGGER_ORDER.forEach(function (name) {
      matrix[name] = { received: 0, evaluated: 0, coalesced: 0, lastAtMs: null };
    });
    var state = {
      version: VERSION,
      burstMs: burstMs,
      foregroundOnly: true,
      backgroundScheduling: false,
      appClosedGuarantee: false,
      nativeReplay: false,
      catchUpMaxAgeMs: CATCH_UP_MAX_AGE_MS,
      triggerOrder: TRIGGER_ORDER.slice(),
      triggerMatrix: matrix,
      triggerHistory: [],
      receivedCount: 0,
      evaluateCount: 0,
      coalescedCount: 0,
      deliveryCount: 0,
      lastTrigger: '',
      lastAtMs: null,
      lastEvaluation: null,
      lastDelivery: null
    };

    function clockMs() {
      try { return finiteNumber(now(), Date.now()); } catch (error) { return Date.now(); }
    }

    function snapshot() {
      return {
        version: state.version,
        burstMs: state.burstMs,
        foregroundOnly: state.foregroundOnly,
        backgroundScheduling: state.backgroundScheduling,
        appClosedGuarantee: state.appClosedGuarantee,
        nativeReplay: state.nativeReplay,
        catchUpMaxAgeMs: state.catchUpMaxAgeMs,
        triggerOrder: state.triggerOrder.slice(),
        triggerMatrix: copyMatrix(state.triggerMatrix),
        triggerHistory: state.triggerHistory.map(function (entry) { return Object.assign({}, entry); }),
        receivedCount: state.receivedCount,
        evaluateCount: state.evaluateCount,
        coalescedCount: state.coalescedCount,
        deliveryCount: state.deliveryCount,
        lastTrigger: state.lastTrigger,
        lastAtMs: state.lastAtMs,
        lastEvaluation: state.lastEvaluation ? Object.assign({}, state.lastEvaluation) : null,
        lastDelivery: state.lastDelivery ? Object.assign({}, state.lastDelivery) : null
      };
    }

    function recordHistory(entry) {
      state.triggerHistory.push(entry);
      if (state.triggerHistory.length > 32) state.triggerHistory.shift();
    }

    function trigger(source, payload) {
      var name = triggerName(source);
      var value = payload && typeof payload === 'object' ? Object.assign({}, payload) : {};
      var atMs = finiteNumber(value.triggerAtMs, finiteNumber(value.schedulerAtMs, clockMs()));
      var row = state.triggerMatrix[name];
      var previousAt = row.lastAtMs;
      var inBurst = previousAt !== null && atMs >= previousAt && atMs - previousAt < burstMs;
      state.receivedCount += 1;
      row.received += 1;
      state.lastTrigger = name;
      state.lastAtMs = atMs;
      if (inBurst) {
        row.coalesced += 1;
        state.coalescedCount += 1;
        recordHistory({ source: name, atMs: atMs, accepted: false, status: 'coalesced', reason: 'trigger-burst' });
        return {
          ok: true,
          status: 'coalesced',
          source: name,
          reason: 'trigger-burst',
          changed: false,
          shownCount: 0,
          nativeShownCount: 0,
          duplicateCount: 1,
          scheduler: snapshot()
        };
      }

      row.evaluated += 1;
      row.lastAtMs = atMs;
      state.evaluateCount += 1;
      var result;
      try {
        result = evaluate(name, value);
      } catch (error) {
        result = { ok: false, status: 'failed', source: name, reason: 'unknown', changed: false };
      }
      var summary = resultSummary(result);
      state.lastEvaluation = summary;
      state.deliveryCount += summary.shownCount + summary.nativeShownCount;
      if (summary.shownCount || summary.nativeShownCount) state.lastDelivery = summary;
      recordHistory({
        source: name,
        atMs: atMs,
        accepted: true,
        status: 'evaluated',
        shownCount: summary.shownCount,
        nativeShownCount: summary.nativeShownCount,
        duplicateCount: summary.duplicateCount,
        catchUpCount: summary.catchUpCount
      });
      if (result && typeof result === 'object') {
        result = Object.assign({}, result, { scheduler: snapshot() });
      }
      return result;
    }

    return { version: VERSION, trigger: trigger, snapshot: snapshot, reset: function () {
      TRIGGER_ORDER.forEach(function (name) {
        matrix[name] = { received: 0, evaluated: 0, coalesced: 0, lastAtMs: null };
      });
      state.triggerMatrix = matrix;
      state.triggerHistory = [];
      state.receivedCount = 0;
      state.evaluateCount = 0;
      state.coalescedCount = 0;
      state.deliveryCount = 0;
      state.lastTrigger = '';
      state.lastAtMs = null;
      state.lastEvaluation = null;
      state.lastDelivery = null;
    } };
  }

  root.ReminderSchedulerV1 = Object.freeze({
    version: VERSION,
    burstMs: DEFAULT_BURST_MS,
    catchUpMaxAgeMs: CATCH_UP_MAX_AGE_MS,
    triggerOrder: TRIGGER_ORDER.slice(),
    create: create
  });
})(typeof window !== 'undefined' ? window : globalThis);
