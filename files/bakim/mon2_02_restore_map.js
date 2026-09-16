// MON2-02 restorasyon bağımlılık haritası
// 1) Restore edilecek her gövde için: HEAD'den çıkarılan gövdede geçen tanımlayıcılar
// 2) Modülde kalan gövdelerin restore edilenlere çağrıları (-> external bag)
import fs from 'node:fs';

const head = fs.readFileSync('/tmp/head_app.js', 'utf8');
const mod = fs.readFileSync('app/core/reminders.js', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');

// Restore listesi: (A) 21 impure + (B) 9 state-writer + migrateReminderState
const RESTORE = [
  'mergePersistedReminderState','reminderPermissionSnapshot','reminderPermissionStorageRead',
  'reminderPermissionStorageWrite','reminderPreviewNotification','reminderNativeDisplay',
  'reminderSystemOffline','reminderDeliveryStorageRead','reminderDeliveryStorageWrite',
  'reminderDeliveryClear','reminderLifecycleDefaultContext','reminderLifecycleDraftActive',
  'reminderLifecycleReplaceTarget','reminderLifecycleUpdateLive','reminderActionStorageRead',
  'reminderActionStorageWrite','reminderLockBodyScroll','reminderUnlockBodyScroll',
  'reminderActiveElementId','reminderRestoreFocus','reminderRemoveLocalKey',
  'appendReminderEvent','persistReminderEvent','reminderPermissionRequest',
  'reminderCurrentRoot','reminderLifecycleRenderIfNeeded','reminderActionCommit',
  'updateReminderPolicy','reminderSetEnabled','reminderCloseForTarget',
  'migrateReminderState'
];

// Modülde kalan + window'a export edilen üyeler (compat export satırlarından türet)
const exportedFromModule = new Set([...mod.matchAll(/root\["([^"]+)"\]=typeof/g)].map(m => m[1]));
const moduleDeclares = new Set([...mod.matchAll(/^ {2}(?:function (\w+)|var (\w+))/gm)].map(m => m[1] || m[2]));

// Modül fonksiyon sınırları (2 boşluklu girintiyle "  function name(" )
function findModuleBody(name) {
  const start = mod.indexOf('  function ' + name + '(');
  if (start < 0) return null;
  const end = mod.indexOf('\n  function ', start + 12);
  return mod.slice(start, end < 0 ? mod.length : end);
}

// Modül fonksiyonlarını bir kez ayrıştır (satır bazlı)
const modLines = mod.split('\n');
const modFns = []; // {name, start, end}
for (let i = 0; i < modLines.length; i++) {
  const m = modLines[i].match(/^ {2}function (\w+)\(/);
  if (m) modFns.push({ name: m[1], start: i });
}
for (let i = 0; i < modFns.length; i++) modFns[i].end = (i + 1 < modFns.length) ? modFns[i + 1].start : modLines.length;

// Modülde restore-listedeki fonksiyonları HÂLÂ çağıran, kendisi restore-listede olmayan gövdeler
console.log('=== MODUL-ICI KALAN CAGRILAR (external bag adaylari) ===');
for (const fn of RESTORE) {
  const needle = fn + '(';
  const callers = new Set();
  for (const f of modFns) {
    if (RESTORE.includes(f.name) || f.name === 'migrateReminderState') continue;
    const body = modLines.slice(f.start, f.end).join('\n');
    if (body.indexOf(needle) >= 0) callers.add(f.name);
  }
  if (callers.size) console.log(fn, '->', [...callers].join(', '));
}

// Her restore gövdesinin HEAD metni + referans ettiği bilinmeyenler
function headBody(name) {
  const start = head.indexOf('function ' + name + '(');
  if (start < 0) return null;
  const end = head.indexOf('\nfunction ', start + 10);
  return head.slice(start, end < 0 ? head.length : end);
}
const APP_JS_KNOWN = new Set(['data','ui','dark','App','SEYMA_REMINDERS','SEYMA_APP_SURFACE','KEY','PRAYER_NAMES','PRAYER_ORDER','ZIKR_V2_VISIBLE','appendEvent','save','saveLocal','render','nowMs','todayStr','activeDate','editing','el','esc','icon','find','download','featuresLive','normalizeSyncReceipt','reminderMigrationStatus','REMINDER_PREFERENCE_SCHEMA_VERSION','REMINDER_EVENT_ACTIONS','REMINDER_EVENT_SUMMARY','reminderEventDigest','reminderEventCorrelation','reminderSchemaCompatibility','reminderSchemaStatusForData','REMINDER_SCHEMA_STATUS','reminderEventActionForDelivery','SYNC_RECEIPT_STATUSES','EVENT_LOG_SCHEMA_VERSION','EVENT_LOG_RECENT_MAX','EVENT_DEVICE_KEY','REMINDER_CHANNELS','REMINDER_POLICY_DEFAULTS','REMINDER_QUIET_BEHAVIORS','REMINDER_CAPACITY_MODES','REMINDER_PRIORITY_RANK','REMINDER_PRIVACY_MODES','REMINDER_RESERVED_JOURNAL_ROOTS','REMINDER_SYNC_BLOCKED_ROOTS','REMINDER_SYNC_BLOCKED_KEY','REMINDER_SNOOZE_OPTIONS','REMINDER_CARE_CATEGORY','REMINDER_CARE_KEYS','REMINDER_MEDICATION_SCHEMA_VERSION','REMINDER_MEDICATION_ID_PREFIX','REMINDER_MEDICATION_NAME_MAX','REMINDER_MEDICATION_LABEL_MAX','REMINDER_MEDICATION_NOTE_MAX','REMINDER_MEDICATION_MAX_SCHEDULES','REMINDER_MEDICATION_NATIVE_TITLE','REMINDER_MEDICATION_NATIVE_BODY','REMINDER_MEDICATION_SAFETY_COPY','REMINDER_SPECIAL_DAYS_ID','REMINDER_SPECIAL_DAYS_MODES','REMINDER_SPECIAL_DAY_OPTIONS','REMINDER_SPECIAL_DAYS_DEFINITION','REMINDER_SPECIAL_NATIVE_TITLE','REMINDER_SPECIAL_NATIVE_BODY','REMINDER_CARE_DEFINITIONS','REMINDER_PROFILE_IDS','REMINDER_PROFILE_LIST','REMINDER_CATEGORY_META','REMINDER_CATEGORY_ORDER','REMINDER_PERMISSION_STATES','REMINDER_PERMISSION_ALIASES','REMINDER_PERMISSION_STORAGE_KEY','REMINDER_NATIVE_PREVIEW_TAG','_reminderBodyLocked','_reminderBodyPrevOverflow','_reminderBodyPrevOverscrollBehavior']);
const JS_GLOBALS = new Set(['Object','Array','String','Number','Boolean','Math','JSON','Date','RegExp','Error','Promise','isNaN','parseInt','parseFloat','window','document','localStorage','navigator','Notification','setTimeout','clearTimeout','setInterval','clearInterval','fetch','globalThis','console','undefined','true','false','null','typeof','return','var','let','const','function','if','else','for','while','try','catch','new','delete','in','of','this','arguments','void','instanceof','Number','Intl','URL','Blob','Map','Set','Symbol']);

console.log('\n=== RESTORE GOVDELERININ MODUL BAGIMLILIKLARI ===');
const missing = {};
for (const fn of RESTORE) {
  const body = headBody(fn);
  if (!body) { console.log(fn, ': HEAD-BULUNAMADI'); continue; }
  const ids = new Set([...body.matchAll(/[A-Za-z_$][\w$]*/g)].map(m => m[0]));
  const unknown = [];
  for (const id of ids) {
    if (JS_GLOBALS.has(id) || JS_GLOBALS.has(id.toLowerCase())) continue;
    if (RESTORE.includes(id) || APP_JS_KNOWN.has(id)) continue;
    if (exportedFromModule.has(id) && moduleDeclares.has(id)) continue;
    if (id === 'fn' || id === 'e' || id === 'x' || id === 'out') continue; // yerel degiskenler asagida el ile
    unknown.push(id);
  }
  if (unknown.length) { missing[fn] = unknown; console.log(fn, '->', unknown.join(',')); }
}
console.log('\nToplam restore:', RESTORE.length, '| modulde declare+export var mi kontrol edildi');