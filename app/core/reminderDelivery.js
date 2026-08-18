(function (root) {
  'use strict';

  // REM-52: notification channel boundary.
  //
  // Seyma has two independent notification channels that must never share a
  // permission field, an id namespace, a tag namespace, a cap or a history
  // store:
  //
  //   * "aeon"     — the pre-existing ÆON social message channel. Persisted in
  //                  `data`, synced, push-capable, body is message content.
  //   * "reminder" — the personal reminder channel. Local-only, never synced,
  //                  foreground-only, body is generic catalog private copy.
  //
  // This module is pure: no DOM, no storage, no network, no timer, no
  // notification construction and no background scheduling capability. It only
  // classifies and validates; the app runtime owns every side effect.
  var VERSION = '1';

  var AEON_TAGS = ['aeon-message', 'aeon-answer'];
  var AEON_TAG_PREFIX = 'aeon-';
  var AEON_PAYLOAD_TYPES = ['aeon-message', 'aeon-answer'];

  var REMINDER_TAG_PREFIX = 'seyma-reminder-v1:';
  var REMINDER_PREVIEW_TAG = 'reminder-preview-v1';
  var REMINDER_PAYLOAD_TYPES = ['reminder', 'reminder-preview'];
  var REMINDER_TOKEN_RE = /^[A-Za-z0-9._:%|+\-]+$/;
  var REMINDER_TOKEN_MAX = 240;
  var REMINDER_TAG_MAX = 220;

  // Permission vocabulary. `prompt` is the Permissions API spelling of the
  // Notification API's `default`; `revoked` is the granted -> default
  // transition, which no single snapshot can express on its own.
  var PERMISSION_STATES = [
    'unsupported', 'default', 'granted', 'denied', 'revoked', 'temporary-error', 'pwa-limited'
  ];
  var PERMISSION_ALIASES = { prompt: 'default', error: 'temporary-error' };
  // States where an explicit user action may still open the browser prompt.
  // Every other state is terminal for this device until the user changes it
  // in browser settings, so the app must never re-ask on its own.
  var PERMISSION_REQUESTABLE = { 'default': true, revoked: true, 'temporary-error': true };

  function freeze(value) {
    return Object.freeze(value);
  }

  function text(value) {
    return String(value == null ? '' : value);
  }

  function has(list, value) {
    return list.indexOf(value) >= 0;
  }

  var CHANNELS = freeze({
    aeon: freeze({
      id: 'aeon',
      kind: 'social',
      owner: 'aeon-message-runtime',
      permissionField: 'data.settings.aeonNotifyPermission',
      permissionScope: 'synced-state',
      idField: 'data.aeon.shownNotificationIds',
      tagPrefix: AEON_TAG_PREFIX,
      tags: freeze(AEON_TAGS.slice()),
      payloadTypes: freeze(AEON_PAYLOAD_TYPES.slice()),
      capKind: 'session-cooldown',
      capField: 'AEON_NOTIFY_COOLDOWN_MS',
      historyField: 'data.aeon.shownNotificationIds',
      historyScope: 'synced-state',
      bodySource: 'message-content',
      pushCapable: true,
      swRole: 'show-and-route'
    }),
    reminder: freeze({
      id: 'reminder',
      kind: 'personal',
      owner: 'reminder-delivery-adapter',
      permissionField: 'localStorage:seyma-reminder-permission-v1',
      permissionScope: 'local-only',
      idField: 'localStorage:seyma-reminder-delivery-v1',
      tagPrefix: REMINDER_TAG_PREFIX,
      tags: freeze([REMINDER_PREVIEW_TAG]),
      payloadTypes: freeze(REMINDER_PAYLOAD_TYPES.slice()),
      capKind: 'daily-native-cap',
      capField: 'data.reminders.policy.nativeDailyCap',
      historyField: 'localStorage:seyma-reminder-actions-v1',
      historyScope: 'local-only',
      bodySource: 'catalog-private-copy',
      pushCapable: false,
      swRole: 'click-transport-only'
    })
  });

  // Honest capability statement. The service worker of a static GitHub Pages
  // app cannot schedule, replay or wake anything; it can only carry a click
  // that the operating system already delivered back into the open app.
  var CAPABILITIES = freeze({
    backgroundScheduling: false,
    backgroundReplay: false,
    closedAppTimedDelivery: false,
    reminderPush: false,
    aeonPush: true,
    foregroundOnly: true,
    serviceWorkerRole: 'click-transport-only'
  });

  // Only these fields may cross into a native notification. Everything else —
  // occurrence detail, surface diagnosis, therapy tool state, medication label,
  // note text — stays inside the app.
  var NATIVE_COPY_FIELDS = freeze(['title', 'body', 'tag', 'deepLink']);
  var NATIVE_BODY_POLICY = freeze({
    source: 'catalog-private-copy',
    allowedFields: NATIVE_COPY_FIELDS,
    detailStaysInApp: true,
    maxTitleLength: 80,
    maxBodyLength: 180
  });

  function channelForTag(tag) {
    var value = text(tag);
    if (!value) return '';
    if (value === REMINDER_PREVIEW_TAG || value.indexOf(REMINDER_TAG_PREFIX) === 0) return 'reminder';
    if (has(AEON_TAGS, value) || value.indexOf(AEON_TAG_PREFIX) === 0) return 'aeon';
    return '';
  }

  function channelForPayloadType(type) {
    var value = text(type);
    if (!value) return '';
    if (has(REMINDER_PAYLOAD_TYPES, value)) return 'reminder';
    if (has(AEON_PAYLOAD_TYPES, value)) return 'aeon';
    return '';
  }

  // A notification belongs to the reminder channel if EITHER its payload type
  // or its tag says so. Requiring both would let a malformed reminder payload
  // fall through to the ÆON route, which is exactly the leak this prevents.
  function channelForNotification(input) {
    var x = input && typeof input === 'object' ? input : {};
    var data = x.data && typeof x.data === 'object' ? x.data : {};
    var byType = channelForPayloadType(data.type !== undefined ? data.type : x.type);
    var byTag = channelForTag(x.tag !== undefined ? x.tag : data.tag);
    if (byType === 'reminder' || byTag === 'reminder') return 'reminder';
    if (byType === 'aeon' || byTag === 'aeon') return 'aeon';
    return '';
  }

  function safeToken(value, max) {
    var token = text(value);
    var limit = Number(max) > 0 ? Number(max) : REMINDER_TOKEN_MAX;
    return token && token.length <= limit && REMINDER_TOKEN_RE.test(token) ? token : '';
  }

  function deliveryTag(occurrenceId) {
    var id = safeToken(occurrenceId, REMINDER_TOKEN_MAX);
    if (!id) return '';
    return (REMINDER_TAG_PREFIX + encodeURIComponent(id)).slice(0, REMINDER_TAG_MAX);
  }

  function parseDeliveryTag(tag) {
    var value = text(tag);
    if (value.indexOf(REMINDER_TAG_PREFIX) !== 0) return '';
    var encoded = value.slice(REMINDER_TAG_PREFIX.length);
    if (!encoded) return '';
    var decoded;
    try {
      decoded = decodeURIComponent(encoded);
    } catch (error) {
      return '';
    }
    return safeToken(decoded, REMINDER_TOKEN_MAX);
  }

  function permissionState(input) {
    var x = input && typeof input === 'object' ? input : {};
    if (x.state === 'error' || x.error === true) return 'temporary-error';
    var declared = text(x.state);
    if (declared) {
      if (PERMISSION_ALIASES[declared]) return PERMISSION_ALIASES[declared];
      if (has(PERMISSION_STATES, declared)) return declared;
    }
    if (x.supported === false) return 'unsupported';
    if (x.pwaLimited === true) return 'pwa-limited';
    if (x.temporaryError === true) return 'temporary-error';
    var live = text(x.permission);
    if (PERMISSION_ALIASES[live]) live = PERMISSION_ALIASES[live];
    if (live === 'granted' || live === 'denied') return live;
    if (live === 'default') {
      // Only a remembered `granted` turns a bare `default` into `revoked`.
      return permissionState({ state: text(x.previous) }) === 'granted' ? 'revoked' : 'default';
    }
    if (x.permission === undefined && x.supported !== true) return 'unsupported';
    return 'temporary-error';
  }

  function canRequestPermission(state) {
    return PERMISSION_REQUESTABLE[permissionState({ state: state })] === true;
  }

  // Disjointness proof: the two channel descriptors must not reuse a single
  // permission / id / tag / cap / history value between them.
  function disjointReport() {
    var fields = ['permissionField', 'idField', 'tagPrefix', 'capField', 'historyField'];
    var shared = [];
    fields.forEach(function (field) {
      if (CHANNELS.aeon[field] === CHANNELS.reminder[field]) shared.push(field);
    });
    CHANNELS.reminder.tags.forEach(function (tag) {
      if (channelForTag(tag) !== 'reminder') shared.push('tag:' + tag);
    });
    CHANNELS.aeon.tags.forEach(function (tag) {
      if (channelForTag(tag) !== 'aeon') shared.push('tag:' + tag);
    });
    CHANNELS.reminder.payloadTypes.forEach(function (type) {
      if (channelForPayloadType(type) !== 'reminder') shared.push('type:' + type);
    });
    CHANNELS.aeon.payloadTypes.forEach(function (type) {
      if (channelForPayloadType(type) !== 'aeon') shared.push('type:' + type);
    });
    return { ok: shared.length === 0, shared: shared };
  }

  // A native copy is safe when it carries only routing fields and repeats none
  // of the private in-app strings it was derived from.
  function nativeCopyReport(copy, privateSamples) {
    var record = copy && typeof copy === 'object' ? copy : {};
    var extraFields = Object.keys(record).filter(function (key) {
      return !has(NATIVE_COPY_FIELDS, key);
    });
    var title = text(record.title);
    var body = text(record.body);
    var samples = (Array.isArray(privateSamples) ? privateSamples : []).map(text).filter(Boolean);
    var leaked = samples.filter(function (sample) {
      return title.indexOf(sample) >= 0 || body.indexOf(sample) >= 0;
    });
    var tooLong = title.length > NATIVE_BODY_POLICY.maxTitleLength || body.length > NATIVE_BODY_POLICY.maxBodyLength;
    return {
      ok: extraFields.length === 0 && leaked.length === 0 && !tooLong && !!title && !!body,
      extraFields: extraFields,
      leaked: leaked,
      tooLong: tooLong
    };
  }

  root.ReminderDeliveryV1 = freeze({
    version: VERSION,
    channels: CHANNELS,
    capabilities: CAPABILITIES,
    permissionStates: freeze(PERMISSION_STATES.slice()),
    permissionAliases: freeze(Object.assign({}, PERMISSION_ALIASES)),
    nativeBodyPolicy: NATIVE_BODY_POLICY,
    reminderTagPrefix: REMINDER_TAG_PREFIX,
    reminderPreviewTag: REMINDER_PREVIEW_TAG,
    safeToken: safeToken,
    deliveryTag: deliveryTag,
    parseDeliveryTag: parseDeliveryTag,
    channelForTag: channelForTag,
    channelForPayloadType: channelForPayloadType,
    channelForNotification: channelForNotification,
    permissionState: permissionState,
    canRequestPermission: canRequestPermission,
    disjointReport: disjointReport,
    nativeCopyReport: nativeCopyReport
  });
})(typeof window !== 'undefined' ? window : globalThis);
