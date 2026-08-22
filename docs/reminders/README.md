# Reminder / Notification UX — Dondurulmuş Ajan Girişi

Reminder programı `REM-00..REM-72` aralığında tamamlandı ve çalışma ağacında
özetlenerek donduruldu. Eski prompt, evidence, ledger ve acceptance planı
dosyaları tarihsel kayıt olarak Git geçmişindedir; yeni ajan bunları otomatik
olarak yeniden canlandırmaz.

## Okuma sırası

1. Root [`AGENTS.md`](../../AGENTS.md) ve gerekiyorsa [`CLAUDE.md`](../../CLAUDE.md)
2. [`GELISTIRME-PLANI.md`](../GELISTIRME-PLANI.md)
3. [`.claude/skills/run-seyma/SKILL.md`](../../.claude/skills/run-seyma/SKILL.md)
   ve [`tests/README.md`](../../tests/README.md)
4. Bu dosya, [`APP-REMINDER-STATE.json`](APP-REMINDER-STATE.json) ve
   [`APP-REMINDER-WORK-SUMMARY.md`](APP-REMINDER-WORK-SUMMARY.md)
5. Yeni işin kapsamına giriyorsa [surface map](APP-REMINDER-APP-PANEL-SURFACE-MAP.md)
   ve [approval gate](APP-REMINDER-APPROVAL-GATE.md)

`activePrompt` yoktur. Yeni reminder davranışı için açık, dar kapsamlı bir
istek; güncel source/test preflight'i ve yeni acceptance koşulları gerekir.
Chat geçmişi veya Git'teki eski prompt dosyaları tek başına yetki değildir.

## Çalışma ağacındaki canonical dosyalar

| Dosya | Rol |
|---|---|
| [`APP-REMINDER-STATE.json`](APP-REMINDER-STATE.json) | Makinece okunabilir dondurulmuş durum ve release kilidi |
| [`APP-REMINDER-WORK-SUMMARY.md`](APP-REMINDER-WORK-SUMMARY.md) | Ajanların okuyacağı kısa program ve test özeti |
| [`APP-REMINDER-APP-PANEL-SURFACE-MAP.md`](APP-REMINDER-APP-PANEL-SURFACE-MAP.md) | App, current panel ve ayrı Panel-v2 sahipliği |
| [`APP-REMINDER-APPROVAL-GATE.md`](APP-REMINDER-APPROVAL-GATE.md) | Canlı, dış sistem ve gerçek veri sınırı |
| [`verify-reminder-freeze.mjs`](verify-reminder-freeze.mjs) | Dondurma/state/test envanteri doğrulayıcısı |

## Güvenli doğrulama

```bash
node docs/reminders/verify-reminder-freeze.mjs
node tests/reminders/run-reminder-smoke.mjs
```

Smoke runner yalnız seçilmiş 20 sentetik Node fixture'ını çalıştırır. Root
current-panel testleri ve `tests/panel-v2/` ayrıca çalıştırılır; birbirlerinin
yerine geçmez. Browser, gerçek ağ, token, gerçek localStorage ve
`mustafaras/seyma-data` yazımı yoktur.

Release approval `not_approved` kalır. Repo hijyeni local dosya temizliğidir;
push, deploy, tag, force-push, başka remote, dış sistem yazımı veya kullanıcı
cihazı kabulü anlamına gelmez.
