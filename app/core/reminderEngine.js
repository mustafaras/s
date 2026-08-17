(function (root) {
  'use strict';

  // REM-46: pure occurrence engine.  This module deliberately has no app
  // clock, DOM, storage, network, notification or policy-state dependency.
  // The app adapter may inject the clock boundary; this file never discovers it.
  var ENGINE_VERSION = '1';
  var DEFAULT_TIMEZONE = 'Europe/Istanbul';
  var DAY_PART_TIMES = { morning: '08:00', day: '12:00', afternoon: '15:00', evening: '19:00', night: '22:00' };
  var PRIORITY_RANK = { P0: 0, P1: 1, P2: 2, P3: 3 };

  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    var parts = value.split('-').map(Number), year = parts[0], month = parts[1], day = parts[2];
    if (month < 1 || month > 12 || day < 1) return false;
    var leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    var days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return day <= days[month - 1];
  }

  function parseTime(value) {
    if (typeof value !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) return null;
    var parts = value.split(':');
    return {
      hour: Number(parts[0]),
      minute: Number(parts[1]),
      second: Number(parts[2] || 0),
      text: parts[0] + ':' + parts[1],
      seconds: Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2] || 0)
    };
  }

  function formatTime(hour, minute) {
    return (hour < 10 ? '0' : '') + hour + ':' + (minute < 10 ? '0' : '') + minute;
  }

  function addDays(date, delta) {
    if (!validDate(date) || !Number.isInteger(delta)) return null;
    var parts = date.split('-').map(Number), shifted = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]) + delta * 86400000);
    return shifted.getUTCFullYear() + '-' + (shifted.getUTCMonth() + 1 < 10 ? '0' : '') + (shifted.getUTCMonth() + 1) + '-' + (shifted.getUTCDate() < 10 ? '0' : '') + shifted.getUTCDate();
  }

  function timezoneValid(timezone) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date(0));
      return true;
    } catch (error) {
      return false;
    }
  }

  function instantMs(input) {
    var x = input && typeof input === 'object' ? input : {};
    var value = Object.prototype.hasOwnProperty.call(x, 'instantMs') ? x.instantMs :
      (Object.prototype.hasOwnProperty.call(x, 'epochMs') ? x.epochMs :
        (Object.prototype.hasOwnProperty.call(x, 'instantIso') ? x.instantIso : x.nowIso));
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value) {
      var parsed = new Date(value).getTime();
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  function localParts(epochMs, timezone) {
    if (!Number.isFinite(epochMs) || !timezoneValid(timezone)) return null;
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date(epochMs));
      var out = {};
      parts.forEach(function (part) { if (part.type !== 'literal') out[part.type] = part.value; });
      var date = String(out.year) + '-' + String(out.month) + '-' + String(out.day);
      var time = String(out.hour) + ':' + String(out.minute) + ':' + String(out.second);
      return validDate(date) && parseTime(time) ? {
        year: Number(out.year), month: Number(out.month), day: Number(out.day),
        hour: Number(out.hour), minute: Number(out.minute), second: Number(out.second),
        localDate: date, localTime: time
      } : null;
    } catch (error) {
      return null;
    }
  }

  function compareDateTime(date, time, otherDate, otherTime) {
    if (!validDate(date) || !validDate(otherDate)) return null;
    var left = parseTime(time), right = parseTime(otherTime);
    if (!left || !right) return null;
    if (date !== otherDate) return date < otherDate ? -1 : 1;
    return left.seconds < right.seconds ? -1 : (left.seconds > right.seconds ? 1 : 0);
  }

  function priority(value) {
    var normalized = String(value || 'P3').toUpperCase();
    return Object.prototype.hasOwnProperty.call(PRIORITY_RANK, normalized) ? normalized : 'P3';
  }

  function source(input, definition) {
    var x = input && typeof input === 'object' ? input : {};
    var d = definition && typeof definition === 'object' ? definition : {};
    return x.prayerData && typeof x.prayerData === 'object' ? x.prayerData :
      (x.prayer && typeof x.prayer === 'object' ? x.prayer :
        (d.prayerData && typeof d.prayerData === 'object' ? d.prayerData : null));
  }

  function prayerTime(input, definition, localDate) {
    var sourceData = source(input, definition), result = { source: sourceData, stale: false };
    if (!sourceData || sourceData.stale === true || sourceData.isStale === true) {
      result.stale = true;
      result.reason = 'stale-prayer-data';
      return result;
    }
    if (input.offline === true && (sourceData.fallback === true || sourceData.offlineFallback === true) && sourceData.fresh !== true) {
      result.stale = true;
      result.reason = 'offline-prayer-data';
      return result;
    }
    var times = sourceData.times && typeof sourceData.times === 'object' ? sourceData.times :
      (sourceData.prayerTimes && typeof sourceData.prayerTimes === 'object' ? sourceData.prayerTimes : sourceData);
    var key = String(input.prayerKey || input.prayerName || definition.prayerKey || definition.prayerName || '');
    if (!key || !times || typeof times[key] !== 'string') { result.reason = 'missing-prayer-time'; return result; }
    var parsed = parseTime(times[key]);
    if (!parsed) { result.reason = 'invalid-prayer-time'; return result; }
    var sourceDate = sourceData.localDate || sourceData.date || sourceData.fetchedForDate || '';
    if (!sourceDate || sourceDate !== localDate) { result.stale = true; result.reason = 'stale-prayer-data'; return result; }
    var fetchedAt = sourceData.fetchedAt || sourceData.updatedAt || '';
    if (!fetchedAt || !Number.isFinite(new Date(fetchedAt).getTime())) { result.stale = true; result.reason = 'stale-prayer-data'; return result; }
    var nowMs = instantMs(input), fetchedMs = new Date(fetchedAt).getTime();
    var maxAgeHours = Number.isFinite(input.prayerMaxAgeHours) ? Math.max(0, input.prayerMaxAgeHours) : 48;
    if (nowMs !== null) {
      var ageHours = (nowMs - fetchedMs) / 3600000;
      if (ageHours < 0 || ageHours > maxAgeHours) { result.stale = true; result.reason = 'stale-prayer-data'; return result; }
    }
    if (input.locationHash && String(input.locationHash) !== String(sourceData.fetchedFor || '')) { result.stale = true; result.reason = 'stale-prayer-data'; return result; }
    if (input.prayerMethod && String(input.prayerMethod) !== String(sourceData.method || '')) { result.stale = true; result.reason = 'stale-prayer-data'; return result; }
    var offset = Number.isInteger(input.offsetMinutes) ? input.offsetMinutes : (Number.isInteger(definition.offsetMinutes) ? definition.offsetMinutes : 0);
    if (Number.isInteger(input.beforeMinutes)) offset = -Math.abs(input.beforeMinutes);
    var total = parsed.hour * 60 + parsed.minute + offset;
    var dayDelta = Math.floor(total / 1440);
    total %= 1440;
    if (total < 0) { total += 1440; dayDelta--; }
    result.time = formatTime(Math.floor(total / 60), total % 60);
    result.localDate = dayDelta ? addDays(localDate, dayDelta) : localDate;
    result.sourceRevision = String(sourceData.revision || sourceData.sourceRevision || definition.sourceRevision || definition.definitionVersion || '');
    result.key = key;
    return result;
  }

  function scheduledTime(input, definition, localDate) {
    var trigger = String(input.triggerType || definition.triggerType || 'fixed-time').toLowerCase();
    var timeValue = input.scheduledAt || input.time || definition.scheduledAt || definition.time;
    if (trigger === 'prayer-offset' || trigger === 'prayer' || input.prayerData || input.prayer) return prayerTime(input, definition, localDate);
    if (trigger === 'day-part' || input.dayPart || definition.dayPart) {
      var part = String(input.dayPart || definition.dayPart || 'day');
      var map = input.dayPartTimes || definition.dayPartTimes || DAY_PART_TIMES;
      timeValue = map[part] || DAY_PART_TIMES[part] || '';
    }
    if (!timeValue && definition.defaultWindow && typeof definition.defaultWindow === 'object') timeValue = definition.defaultWindow.start || '';
    var parsed = parseTime(String(timeValue || ''));
    return parsed ? { time: parsed.text, localDate: localDate, sourceRevision: String(input.sourceRevision || definition.sourceRevision || definition.definitionVersion || ''), stale: false } : null;
  }

  function occurrenceId(reminderId, localDate, scheduledAt, timezone, definitionVersion) {
    return 'reminder-occurrence-v' + ENGINE_VERSION + ':' + [reminderId, localDate, scheduledAt, timezone, definitionVersion].map(function (value) { return encodeURIComponent(String(value == null ? '' : value)); }).join('|');
  }

  function generateOccurrence(input) {
    var x = input && typeof input === 'object' ? input : {};
    var definition = x.definition && typeof x.definition === 'object' ? x.definition : x;
    var reminderId = String(x.reminderId || definition.id || '');
    var timezone = String(x.timezone || definition.timezone || DEFAULT_TIMEZONE);
    var instant = instantMs(x);
    var instantParts = instant === null ? null : localParts(instant, timezone);
    var localDate = validDate(x.localDate) ? x.localDate : (instantParts && instantParts.localDate || '');
    var nowLocalDate = validDate(x.nowLocalDate) ? x.nowLocalDate : (validDate(x.currentLocalDate) ? x.currentLocalDate : (instantParts && instantParts.localDate) || localDate);
    var nowLocalTime = x.nowLocalTime || x.currentLocalTime || (instantParts && instantParts.localTime) || '';
    var fail = function (reason, extra) { return Object.assign({ ok: false, occurrence: null, reason: reason, replay: false, nativeReplay: false, stale: false }, extra || {}); };
    if (!reminderId || !timezoneValid(timezone)) return fail('invalid-timezone-or-reminder');
    if (!localDate || !validDate(localDate)) return fail('invalid-local-date');
    var scheduled = scheduledTime(x, definition, localDate);
    if (!scheduled) return fail('invalid-trigger');
    if (scheduled.stale) return fail(scheduled.reason || 'stale-prayer-data', { stale: true, sourceRevision: scheduled.sourceRevision || '' });
    if (!scheduled.time) return fail(scheduled.reason || 'invalid-trigger');
    if (!scheduled.localDate || !validDate(scheduled.localDate)) return fail('invalid-scheduled-date');
    var scheduledAt = scheduled.time;
    var definitionVersion = String(x.definitionVersion || definition.definitionVersion || '1');
    var comparison = nowLocalTime ? compareDateTime(scheduled.localDate, scheduledAt, nowLocalDate, nowLocalTime) : null;
    var past = comparison !== null && comparison < 0;
    var due = comparison !== null && comparison <= 0;
    var occurrence = {
      reminderId: reminderId,
      occurrenceId: occurrenceId(reminderId, scheduled.localDate, scheduledAt, timezone, definitionVersion),
      localDate: scheduled.localDate,
      scheduledAt: scheduledAt,
      timezone: timezone,
      sourceRevision: String(x.sourceRevision || scheduled.sourceRevision || definition.sourceRevision || definitionVersion),
      priority: priority(definition.priority || x.priority || 'P3'),
      definitionVersion: definitionVersion,
      triggerType: String(x.triggerType || definition.triggerType || 'fixed-time'),
      hijriOffset: Number.isInteger(x.hijriOffset) && x.hijriOffset >= -2 && x.hijriOffset <= 2 ? x.hijriOffset : 0,
      due: due,
      past: past,
      replay: false,
      nativeReplay: false,
      shouldReplay: false
    };
    return Object.assign({ ok: true, reason: null, occurrence: occurrence }, occurrence);
  }

  root.ReminderEngineV1 = Object.freeze({
    version: ENGINE_VERSION,
    defaultTimezone: DEFAULT_TIMEZONE,
    validDate: validDate,
    parseTime: parseTime,
    addDays: addDays,
    timezoneValid: timezoneValid,
    instantMs: instantMs,
    localParts: localParts,
    compareDateTime: compareDateTime,
    occurrenceId: occurrenceId,
    generateOccurrence: generateOccurrence
  });
})(typeof window !== 'undefined' ? window : globalThis);
