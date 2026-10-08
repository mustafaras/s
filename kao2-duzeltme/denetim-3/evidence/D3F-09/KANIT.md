# D3F-09 — F-09: u09.01'in inceleme damgası yeni metnin tarihine çekildi; araç ve test bunu artık zorunlu tutuyor

Oturum: claude-opus-5-5 · 2026-10-08 · D3F-09

## Kök neden
`2fe3abf6` (D2F-12, 2026-10-07, Copilot CLI uygulaması) `u09.01`'in başlığını ve hedefini yeniden yazdı, ama eski metnin
`review.at: "2026-10-02"` damgasını yeni metne taşıdı (`delegatedAt: "2026-10-02"` da öyle yazıldı). Yeni metin 2026-10-02'de yoktu;
kararı denetim-2 LEDGER seq 17'de (2026-10-07) devirle verildi. D2F-11 planı "yeni metin draft başlar, D2F-12'de devirle sourced olur" diyordu.
Araç tarafında iki eksik bunu mümkün kılıyordu:
1. `--apply-review`, zaten görünür bir kaydı yeniden onaylarken açık `--at` verilse bile `at` yazmıyordu (yalnız `draft → sourced` geçişinde).
2. `--apply-review` çıktı inceleme sayfalarını yalnız onaylanan kutularla yazıyordu; tek kutulu sayfayla yapılan bir onay, öteki 132 işareti düşürürdü.

## Ölçüm
`texts.tr.json`'un tam git geçmişi (`--follow`, arşivden taşıma dahil, 11 commit): 158 kayıttan **yalnız `u09.01`** damgası metninden eski.
İlk ölçümüm 10 sahte ihlal verdi; çünkü dosyanın yeni yola taşındığı commit'i (`d19b4576`) "değişim" saydı. `--follow` ve ilk görünüşü
değişim saymama ile düzeltildi. Ayrıca `--follow` ile `--reverse` birlikte çalışmıyor; sıralama kodda ters çevrildi.

## Yapılan
- **Test (değişmez):** `test_kao2_text_review.js` → "D3F-09: inceleme damgası metnin son değişiminden eski değil (git geçmişi)".
  Her görünür kayıt için `at` ve `delegatedAt` ≥ metnin son değiştiği commit tarihi olmalı. Commit'lenmemiş metin değişikliği bugünün
  tarihini alır; git yoksa SKIP yazar (sessiz PASS değil).
- **Araç** (`tools/kao2-curriculum-build.mjs`):
  - görünür kaydın açık `--at` ile yeniden onayı `at`'ı yazar; `--at` verilmezse ilk onay tarihi korunur, böylece eski davranış bozulmaz.
  - apply yolu önceki sayfanın işaretlerini taşır (`withCarriedMarks`), sonra onaylananları işaretler.
- **Veri (araçla, elle değil):** tek kutusu (`u09.01`) işaretli bir sayfayla
  `--apply-review --at 2026-10-07 --by ai-delegated --delegated-by owner --delegated-at 2026-10-07`.
  Sonuç: `texts.tr.json` ve `quranCurriculumV2.js`'te yalnız `u09.01`'in `at` ve `delegatedAt` değerleri 2026-10-07 oldu.
  INCELEME-17 "Onayı kim verdi" bölümü veriden iki grup gösteriyor (132 × 2026-10-02, 1 × 2026-10-07). İşaretler korundu: 133 / 25.
  Sayımlar bozulmadı: 158 kayıt · sourced 158 · ai-delegated 158 · owner 0.
- `delegatedAt` 2026-10-07: yeni metnin onayı denetim-2 seq 17'deki (2026-10-07) devre dayanır; 2026-10-02 devri o metni kapsayamaz.
  Raporun önerisi yalnız `at`'tı; değişmez testi `delegatedAt`'ı da yakaladı.
- **Pin** `20261008a` → **`20261008b`** (çalışma zamanı modülü değişti): index.html ×17, sw.js ×18 (`SW_VERSION`, `SW_OFFLINE_VERSION`),
  panel-v2.html ×2, 12 pin testi, `D3F-STATE.pins.release`. Pin testleri 12/12 ve `run-seyma/driver.mjs` rc=0.
- **CLAUDE.md + AGENTS.md** KAO2 satırı: `delegatedAt` cümlesine u09.01 istisnası eklendi; iki dosya aynı tutuldu.

## Bilerek değişen testler
- `test_kao2_text_review.js` "devirle onaylanan 158 metin…": `delegatedAt` artık `u09.01` için 2026-10-07, ötekiler için 2026-10-02.
- `test_kao2_review_apply.js`: iki yeni kontrol. Sınama tarihi verideki tarihten **farklı** seçilir (`2026-10-08`). İlk sürümde aynıydı ve
  M3 mutasyonu (araç `--at`'ı yok sayar) testi geçirdi; zayıflık mutasyonla bulunup kapatıldı.

## TDD
- RED: değişmez → `onay damgası metinden eski: u09.01.at=2026-10-02 < metin 2026-10-07 · u09.01.delegatedAt=2026-10-02 < metin 2026-10-07`;
  apply → `açık --at yazılmadı`, ardından ayrı ayrı `çıktı sayfasında işaret sayısı düştü (1 !== 133)`.
- GREEN: text_review 14/14 · review_apply 18/18 · iki üretim bayt-eş (INCELEME-17/18, MUFREDAT-ESLEME, quranCurriculumV2, quranConceptTextsV1), taşıma uyarısı yok.
- Mutasyon: `bash kao2-duzeltme/denetim-3/evidence/D3F-09/damga-mutasyon.sh` → **6/6 PASS** (M0 ×2 yeşil · M1 eski damga · M2 commit'lenmemiş
  metin değişikliği · M3 `--at` yok sayılır · M4 kısmi sayfa işaret düşürür). İlk koşuda M1 yanlış nedenle kırmızıydı ("158" testi önce düştü),
  M3 ise yeşil kaldı; ikisi de betiğin gerekçe denetimiyle yakalandı ve düzeltildi.

## Sınır
- Değişmez, metin değişimini commit tarihine (`%cs`) göre ölçer; aynı gün içindeki sıralamayı ayırt etmez.
- Kapsam yalnız `texts.tr.json` kayıtları (133 metin + 25 kavram).

## Kanıt düzeyleri
kaynak/test ✓ · yayın → YAYIN-7 · canlı → YAYIN-7 · cihaz — (kullanıcıda; görünen metin değişmedi, yalnız modüldeki inceleme tarihi)

## Ek (commit sonrası kapı)
Commit sonrası hızlı sette `D3F-06/inceleme-mutasyon.sh` M6 kırmızı verdi. Sayfa doğruydu (veriyi izledi: 131 + 1 devir, owner 1);
kırmızının nedeni M6'nın beklentiyi sabit "132" olarak yazmasıydı. D3F-09 verideki devir gruplarını değiştirince bu sabit bayatladı (F-14 dersi).
M6 artık beklentiyi klondaki veriden hesaplıyor; ters tırnak bash komut ikamesine düştüğü için JS'te `String.fromCharCode(96)` kullanıldı.
Sonuç: d3f06 mutasyon 7/7 PASS (`owner 1 · devir veri 132 / sayfa 132`).
