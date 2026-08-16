#!/usr/bin/env node

import assert from "node:assert/strict";

const ALLOWED_SOURCES = new Set([
  "synthetic_fixture",
  "local_aggregate",
  "explicit_user_feedback"
]);

const SAFE_FIELDS = new Set([
  "assertionCount",
  "bucket",
  "dismissCount",
  "feedbackBucket",
  "fixtureCase",
  "inAppCount",
  "localCount",
  "muteCount",
  "nativeCount",
  "snoozeCount"
]);

const DIMENSIONS = ["control", "calmness", "access", "privacy", "trust"];

const CONTRACT = {
  id: "REM-30",
  version: "1.0",
  allowedSources: [...ALLOWED_SOURCES],
  storage: {
    rawEvents: false,
    externalTelemetry: false,
    remoteSync: false,
    panelProjection: false,
    userIdentity: false,
    sensitiveDimensions: false
  },
  measurementFields: [
    "assertionCount",
    "bucket",
    "dismissCount",
    "feedbackBucket",
    "fixtureCase",
    "inAppCount",
    "localCount",
    "muteCount",
    "nativeCount",
    "snoozeCount"
  ],
  prohibitedDimensions: [
    "userId",
    "deviceId",
    "sessionId",
    "reminderId",
    "occurrenceId",
    "category",
    "mood",
    "therapy",
    "journal",
    "ibadet",
    "prayer",
    "medication",
    "note",
    "body",
    "freeText",
    "location",
    "token"
  ],
  goals: [
    {
      id: "control",
      title: "Kullanıcı kontrolü",
      acceptance: {
        control: "Kategori, kanal, erteleme, bugün sustur ve kalıcı kapatma tek merkezden geri alınabilir.",
        calmness: "Kapatma veya erteleme kullanıcıyı cezalandırmaz ve yeni bildirim yoğunluğu doğurmaz.",
        access: "Kontroller açık adlandırılmış, klavye ve ekran okuyucu ile erişilebilir olmalıdır.",
        privacy: "Kontrol eylemleri kimlik, occurrence veya hassas kategori boyutuyla ölçülmez.",
        trust: "Uygulanan, bekleyen ve desteklenmeyen tercih durumları birbirinden ayrılır."
      }
    },
    {
      id: "calmness",
      title: "Sakinlik ve düşük yoğunluk",
      acceptance: {
        control: "Dismiss, snooze ve mute her sunumda görünür ve düşük maliyetli çıkışlardır.",
        calmness: "Sentetik gün penceresinde kullanıcı bütçesi, quiet hours ve duplicate sınırı aşılmaz.",
        access: "Native kanal yoksa aynı bağlam uygulama içi, tekrar üretmeyen bir fallback olarak kalır.",
        privacy: "Kilit ekranı metni genel kalır; ayrıntı yalnız uygulama içi yüzeydedir.",
        trust: "Sessiz gün veya düşük bildirim sayısı eksik etkileşim diye yorumlanmaz."
      }
    },
    {
      id: "actionability",
      title: "Eyleme geçiricilik ve erişim",
      acceptance: {
        control: "Kullanıcı tek ana adıma gidebilir veya hiçbir adım seçmeden çıkabilir.",
        calmness: "Akış tek ana eylem ve sakin seçenek dili taşır; aciliyet veya utanç üretmez.",
        access: "Allowlisted deep-link, focus, metin, kontrast ve dokunma alanı sentetik fixture’da geçer.",
        privacy: "Deep-link ve payload hassas gövde, not veya kategori adı taşımaz.",
        trust: "Offline, permission-limited veya unsupported durumlarda fallback gösterilir; başarı iddia edilmez."
      }
    },
    {
      id: "privacy",
      title: "Mahremiyet ve veri güvenliği",
      acceptance: {
        control: "Kullanıcı özet ölçümü beklemeden clear, reset ve izin geri alma eylemlerini kullanabilir.",
        calmness: "Ölçüm için pasif izleme, analitik izni veya ekstra bildirim istenmez.",
        access: "Kullanıcı sözleşmenin neyi ölçmediğini ve hangi yerel sınırda kaldığını anlayabilir.",
        privacy: "Mood, terapi, journal, ibadet/prayer, medication, note, body, identity ve raw event alanları yasaktır.",
        trust: "Contract kişisel profil veya klinik/manevi sonuç çıkarmadığını açıkça söyler."
      }
    },
    {
      id: "trust",
      title: "Güven ve dürüst capability",
      acceptance: {
        control: "Açık kullanıcı geri bildirimi reddedebilir, silebilir veya daha az istemeyi belirtebilir.",
        calmness: "Dismiss, snooze, mute ve düşük yoğunluk güvenlik sinyalidir; engagement hedefi değildir.",
        access: "Foreground, native permission, offline ve background guarantee durumları ayrı adlandırılır.",
        privacy: "Dış telemetry, production endpoint, gerçek kullanıcı verisi ve panel aktarımı zorunlu değildir.",
        trust: "Her metrik için yanlış yorum riski ve kanıt seviyesi yazılıdır."
      }
    }
  ],
  metrics: [
    {
      id: "control_reversibility",
      source: "synthetic_fixture",
      role: "primary",
      fields: ["fixtureCase", "assertionCount"],
      misinterpretationRisk: "Fixture PASS gerçek cihazda kontrolün her yüzeyde erişilebilir olduğunu kanıtlamaz."
    },
    {
      id: "notification_density_under_cap",
      source: "local_aggregate",
      role: "safety",
      fields: ["bucket", "nativeCount", "inAppCount", "localCount"],
      misinterpretationRisk: "Düşük sayı tek başına sakinlik veya memnuniyet kanıtı değildir; bağlam ve açık geri bildirim gerekir."
    },
    {
      id: "action_path_reachability",
      source: "synthetic_fixture",
      role: "primary",
      fields: ["fixtureCase", "assertionCount"],
      misinterpretationRisk: "Target path PASS kullanıcının eylemi istediğini veya tamamladığını göstermez."
    },
    {
      id: "click_through_and_completion",
      source: "synthetic_fixture",
      role: "secondary",
      fields: ["fixtureCase", "assertionCount"],
      misinterpretationRisk: "Click veya completion tek başına ürün başarısı, sağlık, ibadet veya ruh hâli sonucu değildir."
    },
    {
      id: "privacy_boundary_zero_violations",
      source: "synthetic_fixture",
      role: "safety",
      fields: ["fixtureCase", "assertionCount"],
      misinterpretationRisk: "Sentetik negatif PASS üretimde bilinmeyen bir sızıntı olmayacağını garanti etmez."
    },
    {
      id: "capability_honesty",
      source: "synthetic_fixture",
      role: "safety",
      fields: ["fixtureCase", "assertionCount"],
      misinterpretationRisk: "Headless capability PASS kullanıcı cihazındaki OS/PWA davranışının yerine geçmez."
    },
    {
      id: "explicit_feedback_bucket",
      source: "explicit_user_feedback",
      role: "primary",
      fields: ["feedbackBucket", "localCount"],
      misinterpretationRisk: "Gönüllü geri bildirim cevap vermeyen kullanıcıları temsil etmez ve genellenemez."
    }
  ],
  safetySignals: [
    {
      id: "dismiss",
      interpretation: "Kullanıcının o an istemediğini veya çıkış yolunun işe yaradığını gösteren yerel karar sinyalidir.",
      misinterpretationRisk: "Başarısızlık, ilgisizlik veya daha fazla hatırlatma ihtiyacı diye okunamaz."
    },
    {
      id: "snooze",
      interpretation: "Zamanlama veya kapasite uyumsuzluğu için yerel ayar sinyalidir.",
      misinterpretationRisk: "Daha sık bildirim gönderme gerekçesi olamaz."
    },
    {
      id: "mute",
      interpretation: "Kullanıcının yoğunluğu azaltma veya kategoriyi bırakma tercihidir.",
      misinterpretationRisk: "Retention kaybı veya yeniden kazanım hedefi diye yorumlanamaz."
    },
    {
      id: "low_notification_density",
      interpretation: "Kullanıcı bütçesine ve sakinlik sınırına uyum için güvenlik sinyalidir.",
      misinterpretationRisk: "Engagement düşüşü veya ürün başarısızlığı diye yorumlanamaz."
    }
  ]
};

let assertions = 0;
function check(condition, message) {
  assert.ok(condition, message);
  assertions += 1;
}

check(CONTRACT.id === "REM-30", "contract id must be REM-30");
check(CONTRACT.version === "1.0", "contract version must be explicit");
check(
  CONTRACT.allowedSources.every((source) => ALLOWED_SOURCES.has(source)),
  "only synthetic, local aggregate and explicit feedback sources are allowed"
);
check(CONTRACT.allowedSources.length === 3, "allowed source list must stay narrow");
check(CONTRACT.storage.rawEvents === false, "raw event storage is forbidden");
check(CONTRACT.storage.externalTelemetry === false, "external telemetry is forbidden");
check(CONTRACT.storage.remoteSync === false, "metric remote sync is forbidden");
check(CONTRACT.storage.panelProjection === false, "metric panel projection is forbidden");
check(CONTRACT.storage.userIdentity === false, "user identity is forbidden");
check(CONTRACT.storage.sensitiveDimensions === false, "sensitive dimensions are forbidden");
check(
  CONTRACT.measurementFields.every((field) => SAFE_FIELDS.has(field)),
  "measurement fields must remain aggregate-safe"
);
check(CONTRACT.goals.length === 5, "five product goals must be covered");

for (const goal of CONTRACT.goals) {
  check(Boolean(goal.id) && Boolean(goal.title), `${goal.id || "goal"} needs an id and title`);
  check(
    Object.keys(goal.acceptance).sort().join(",") === DIMENSIONS.slice().sort().join(","),
    `${goal.id} must define control, calmness, access, privacy and trust acceptance criteria`
  );
  for (const dimension of DIMENSIONS) {
    check(
      typeof goal.acceptance[dimension] === "string" && goal.acceptance[dimension].length > 20,
      `${goal.id}.${dimension} acceptance criterion is missing`
    );
  }
}

check(CONTRACT.metrics.length >= 6, "contract needs primary, safety and secondary metrics");
check(
  CONTRACT.metrics.some((metric) => metric.id === "click_through_and_completion" && metric.role === "secondary"),
  "click-through and completion must be secondary"
);
check(
  CONTRACT.metrics.some((metric) => metric.id === "notification_density_under_cap" && metric.role === "safety"),
  "notification density must be a safety metric"
);
check(
  CONTRACT.metrics.every((metric) => ALLOWED_SOURCES.has(metric.source)),
  "each metric must use an allowed source"
);
for (const metric of CONTRACT.metrics) {
  check(metric.fields.every((field) => SAFE_FIELDS.has(field)), `${metric.id} contains an unsafe field`);
  check(metric.misinterpretationRisk.length > 20, `${metric.id} needs a written misinterpretation risk`);
}

const requiredSignals = ["dismiss", "snooze", "mute", "low_notification_density"];
for (const signalId of requiredSignals) {
  const signal = CONTRACT.safetySignals.find((candidate) => candidate.id === signalId);
  check(Boolean(signal), `${signalId} must be a safety signal`);
  check(signal.interpretation.length > 20, `${signalId} needs a safety interpretation`);
  check(signal.misinterpretationRisk.length > 20, `${signalId} needs a misinterpretation risk`);
}

check(
  CONTRACT.prohibitedDimensions.includes("mood") &&
    CONTRACT.prohibitedDimensions.includes("therapy") &&
    CONTRACT.prohibitedDimensions.includes("ibadet") &&
    CONTRACT.prohibitedDimensions.includes("medication"),
  "mood, therapy, ibadet and medication dimensions must be prohibited"
);
check(
  CONTRACT.prohibitedDimensions.includes("userId") &&
    CONTRACT.prohibitedDimensions.includes("deviceId") &&
    CONTRACT.prohibitedDimensions.includes("freeText"),
  "identity and raw text dimensions must be prohibited"
);
check(
  CONTRACT.metrics.every((metric) => metric.source !== "production_telemetry"),
  "production telemetry must not become a metric source"
);
check(
  CONTRACT.safetySignals.every((signal) => !/başarı|başarısızlık hedefi/i.test(signal.interpretation)),
  "safety signals must not be framed as engagement success"
);

console.log(`REM-30 METRICS PASS: ${assertions} assertions; no external telemetry or sensitive profile dimensions`);
