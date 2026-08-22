# Şeyma Dokümantasyon Haritası

Bu klasör, uygulama kodunu tekrar anlatan dağınık notlar için değil, uzun
ömürlü ürün kararlarının, yürütme planlarının ve ajanlar arası kanıtların
canonical sahipliğini belirlemek için kullanılır.

Tamamlanan ana işlerin kısa özeti için [`WORK-SUMMARY.md`](WORK-SUMMARY.md)
okunur. Bu dosya yönlendirme haritasıdır; güncel durum ve test kanıtı ilgili
state/ledger/source dosyalarından yeniden doğrulanır.

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
| Hatırlatma / bildirim UX çalışması | [`reminders/README.md`](reminders/README.md) ve [`reminders/APP-REMINDER-WORK-SUMMARY.md`](reminders/APP-REMINDER-WORK-SUMMARY.md) | Dondurulmuş durum, yüzey özeti ve 20 fixture bakım seti |
| Hatırlatma release / canlı eylemi | [`reminders/APP-REMINDER-APPROVAL-GATE.md`](reminders/APP-REMINDER-APPROVAL-GATE.md) | Exact kullanıcı onayı, state scope ve ayrı deploy evidence |
| Reminder ürün ve yürütme özeti | [`reminders/APP-REMINDER-WORK-SUMMARY.md`](reminders/APP-REMINDER-WORK-SUMMARY.md) | Dondurulmuş durum, yüzey sahipliği ve bakım doğrulaması |

## Dokümantasyon sınırları

- `docs/reminders/` yalnız hatırlatma programının dondurulmuş özeti, makinece
  okunabilir durumu ve güvenlik/yüzey sınırlarını kapsar; başka feature’ların
  ledger’ı burada tutulmaz.
- Root `AGENTS.md` güncel talimatların sahibidir; burada kuralların uzun
  kopyası tutulmaz.
- Dondurulmuş iş özeti tarihsel sohbet hafızası değildir; mevcut durum,
  korunan yüzeyler, güvenli sınırlar ve bakım doğrulama komutunu kaydeder.
- Tamamlanmış ham plan, promptbook, evidence ve handoff bytes'ı çalışma
  ağacında tutulmaz; gerektiğinde Git geçmişinden incelenir.
- Hassas kullanıcı verisi, token, ham günlük metni, notification body veya
  gerçek senkron payload’ı hiçbir dokümana yazılmaz.
- Reminder için çalışma ağacında yalnız `README.md`, state, kısa iş özeti,
  surface map, approval gate ve freeze validator tutulur; eski prompt/evidence
  zinciri Git geçmişindedir.

## Okuma sırası

Yeni bir hatırlatma işi için önce root talimatları ve roadmap, sonra
[`reminders/README.md`](reminders/README.md), state, iş özeti ve ilgili yüzey
haritası okunur. Eski prompt/evidence zinciri otomatik olarak canlandırılmaz;
new work için açık kapsam ve güncel acceptance gerekir.
