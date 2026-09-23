# IIP-12 · requirements gate

Fixture: `tests/app/test_iip_12.js` — **92 kontrol, 92 PASS / 0 FAIL**
Ağsız `node:vm`; sentetik `data`/`ui`; gerçek `app/core/saygi.js` registry'si.

## REQ-023 / TC-023 — Günün kürasyonu

**Kabul:** Tek odak önerisi kaynak/süre ve seçim gerekçesiyle; deterministik seçilir.
**Olumsuz:** Aynı gün yeniden render öneriyi rastgele değiştirmez; içerik yoksa dürüst boş hâl.

Olumlu senaryolar (hepsi PASS):

| Kontrol | Kanıt |
|---|---|
| Öneri hazır + kaynak nesnesi var | `state==='ready' && source` |
| Kaynak etiketi okunur | `Günün öncüsü` / `Âyet vitrini` |
| Tahmini süre taşınır | `5–10 dk` / `2–3 dk` |
| Seçim gerekçesi yazılı | metin `/deterministik/` içerir |
| Determinizm (bağımsız iki sandbox, aynı gün) | `fa.source.id === fb.source.id` |
| Tekrar render seçimi değiştirmez | aynı sandbox iki çağrı, aynı `id` |
| Kaynak yalnız kabul edilmiş listeden | `['oncu','ayet'].includes(id)` |
| CTA gerçek yüzey açar (no-op değil) | `App.openSaygiPreview()` / `App.openQuranJourney()` |
| Gün geçişinde seçim türetilir | 6 gün çökmeden kaynak üretir |
| Altı gün tek kaynağa çakılı değil | `new Set(ids).size > 1` |

Olumsuz senaryolar (hepsi PASS):

| Kontrol | Kanıt |
|---|---|
| İçerik yok → `empty` ve kaynak yok | `state==='empty' && !source` |
| Boş hâl gerekçeli | metin `/kabul edilmiş içerik/` |
| Boş hâlde **hiç CTA yok** | `/onclick="App\./` bulunmaz |

## REQ-024 / TC-024 — Devam etme

**Kabul:** Yalnız mevcut geçerli aktif zikir/Kur’an kaydı; yeni state kopyası yok.
**Olumsuz:** Boş/bozuk/arşivlenmiş kayda giden Devam düğmesi oluşmaz.

Olumlu senaryolar (hepsi PASS):

| Kontrol | Kanıt |
|---|---|
| İki geçerli kayıt → iki satır | `rows.length===2` |
| Sabit sıra Zikir → Kur’an | `rows[0].label='Yâ Latîf'`, `rows[1].label='Alak'` |
| Zikir gerçek oranı yazar | `250/1000 → %25 · hatim ilerliyor` |
| Kur’an gerçek durumu yazar | `watching → 'İzleniyor · kaldığın yer'` |
| Durum → doğru eylem | `watching→openQuranJourney`, `ready→quranJourneyWatch`, `watched→quranJourneyQuestion` |
| HTML iki düğme basar | `<button` sayısı 2 |
| Stilli mevcut kart sınıfı | `saygi-source-card` + `saygi-link-copy` |
| Buton font eşitlemesi | `font:inherit` |

Olumsuz senaryolar (hepsi PASS) — **satır yok + HTML boş**:

| Bozuk/geçersiz durum | Sonuç |
|---|---|
| `quranJourney` hiç yok | satır yok |
| `quranJourney` bozuk (dizi) | satır yok |
| `quranJourney` bozuk (metin) | satır yok |
| Geçersiz sûre kimliği | satır yok |
| `requests` bozuk | satır yok |
| Sûre kaydı yok | satır yok |
| `idle` | satır yok |
| `request_error` | satır yok |
| `notification_error` | satır yok |
| `invalid_reply` | satır yok |
| `video_unavailable` | satır yok |
| `queued` (bekleme) | satır yok |
| `notified` (bekleme) | satır yok |
| `awaiting_reply` (bekleme) | satır yok |
| `submitting` (bekleme) | satır yok |
| `question_opened` (durak tamam) | satır yok |
| **Arşivlenmiş hatim** | satır yok |
| Hatim yok | satır yok |
| Zikir görünmez | satır yok |
| Hedefi 0 olan bozuk hatim | satır yok |

**Yeni state kopyası yok (kilit kanıt):**

| Kontrol | Kanıt |
|---|---|
| Render öncesi/sonrası `data` bit bit aynı | `JSON.stringify` karşılaştırması |
| `quranJourney` değişmedi | tam nesne karşılaştırması |
| Yeni kalıcı alan açılmadı | `Object.keys(data) === ['days','quranJourney','saygi']` |
| Ağ/depo/timer açılmaz | sayaçlar `fetch=0 storage=0 timers=0` |

## Durum matrisi (brief: boş/yükleniyor/hata/dönüş)

| Durum | Beklenen | Sonuç |
|---|---|---|
| **yükleniyor** (`ui.saygiLoading`) | odak yine basılır (ağ durumundan bağımsız) | PASS |
| **hata** (`ui.saygiError`) | odak yine basılır; devam yüzeyi korunur | PASS |
| **boş** (içerik yok) | hub çökmez; boş hâl; Devam grubu yok | PASS |
| **dönüş** (aynı girdi) | iki bağımsız render **bit bit aynı**, hash sabit | PASS |

Sentetik Bugün hub sha256 = `d40a7f8a76116d89d9a9686ed0e6fd6cf3cd1d5c87fae2fcafc7c8b4403f67e7` (926 bayt).

## Mutasyon kanıtı (bekçiler gerçekten yakalıyor)

| Mutasyon | Bekçi | Sonuç |
|---|---|---|
| `saygi-continue` (CSS'siz) sınıfı sızdırıldı | "CSS'siz yeni sınıf bırakılmadı" | **yakaladı** (1 FAIL) |
| `idle` resume listesine eklendi | bozuk/kayıt yok kontrolleri | **yakaladı** (6 FAIL) |
| `queued` resume listesine eklendi | bekleme ≠ devam kontrolleri | **yakaladı** (2 FAIL) |
| `h.target>0` → `>=0` | "hedefi 0 olan bozuk hatim" | **yakaladı** (1 FAIL) |

Her mutasyon geri alındı; geri yükleme sonrası fixture yeniden **92/92**.
