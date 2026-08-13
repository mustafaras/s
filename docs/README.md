# Şeyma Dokümantasyon Haritası

Bu klasör, uygulama kodunu tekrar anlatan dağınık notlar için değil, uzun
ömürlü ürün kararlarının, yürütme planlarının ve ajanlar arası kanıtların
canonical sahipliğini belirlemek için kullanılır.

## Canonical rol dağılımı

| Rol | Canonical kaynak | Sorumluluk |
|---|---|---|
| Constitution | [`../AGENTS.md`](../AGENTS.md) ve [`../CLAUDE.md`](../CLAUDE.md) | Her ajanın uyması gereken güvenlik, kapsam ve doğrulama kuralları |
| Map | Bu dosya ve alt klasör `README.md` dosyaları | Nerede ne var, hangi belge ne zaman okunur |
| Status | İlgili yürütme ledger’ı ve machine-readable state | Aktif prompt, blocker, kanıt seviyesi ve güvenli sonraki adım |
| History | İlgili karar günlüğü / ADR ve Git geçmişi | Geriye dönük karar gerekçesi, intentional removal ve düzeltmeler |

Bir olgu için tek bir canonical sahip vardır. Diğer belgeler aynı içeriği
kopyalamaz; bağlantı verir.

## Görev yönlendirme

| İhtiyaç | Oku | Sonra doğrula |
|---|---|---|
| Genel Şeyma geliştirmesi | [`../GELISTIRME-PLANI.md`](../GELISTIRME-PLANI.md) | İlgili kaynak dosya ve headless fixture |
| Uygulama çalıştırma / render | [`../.claude/skills/run-seyma/SKILL.md`](../.claude/skills/run-seyma/SKILL.md) | `driver.mjs`, ilgili harness ve syntax |
| Panel-v2 Premium | [`../archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md`](../archive/PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/CURRENT-STATE.md) | [`../tests/panel-v2/`](../tests/panel-v2/) |
| Hatırlatma / bildirim UX çalışması | [`reminders/README.md`](reminders/README.md) | Ledger, state, prompt ve test matrisi |
| Hatırlatma release / canlı eylemi | [`reminders/APP-REMINDER-APPROVAL-GATE.md`](reminders/APP-REMINDER-APPROVAL-GATE.md) | Exact kullanıcı onayı, state scope ve ayrı deploy evidence |
| Planın ürün gerekçesi | [`plans/APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md`](plans/APP-HATIRLATMA-VE-BILDIRIM-UX-PLANI.md) | Mevcut `app.js`, `sync.js`, `sw.js`, `GELISTIRME-PLANI.md` |

## Dokümantasyon sınırları

- `docs/reminders/` yalnız hatırlatma programının yürütme ve context
  yönetimini kapsar; başka feature’ların ledger’ı burada tutulmaz.
- Root `AGENTS.md` güncel talimatların sahibidir; burada kuralların uzun
  kopyası tutulmaz.
- Ledger tarihsel sohbet hafızası değildir. Yalnızca mevcut durum, kanıt ve
  bir sonraki güvenli adımı kaydeder.
- Hassas kullanıcı verisi, token, ham günlük metni, notification body veya
  gerçek senkron payload’ı hiçbir dokümana yazılmaz.
- Tamamlanan prompt dosyası silinmez; sonuç ve kanıt ledger’da kalır. Ancak
  prompt’un canlı durumunu ledger dışındaki bir belgede tekrar etmeyiz.

## Okuma sırası

Yeni bir hatırlatma oturumu için önce root talimatları ve roadmap, sonra
[`reminders/README.md`](reminders/README.md), yalnız ilgili prompt ve ilgili
test sözleşmesi okunur. Aktif prompt açıkça belirtmiyorsa planın tamamını
yeniden yüklemek gerekmez.
