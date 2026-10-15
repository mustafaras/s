# K3P · CURRENT-STATE

Sıradaki prompt: K3P-18

## Son durum

- **Tarih:** 2026-10-15.
- **Son tamamlanan:** K3P-17 — R3 "harflerden kur" görevi. 27/37 kart tamamlandı. K3P-18 açılmadı.
- **Yetki:** kullanıcı 2026-10-15'te K3P-17'yi "tam ve kusursuz biçimde uygula" isteğiyle açtı. Yalnız yerel commit; push/merge/deploy/tag yok. Final `releaseApproval=NOT_APPROVED` ve K3P-18 yetkisi yok. K3P-16 ara yayını ayrı kullanıcı onayıyla canlıdadır.
- **Yayın:** Yeni yayın yok. Yayın pini **20261015b** (K3P-16 ara yayını). `pinDeferral.files = ["app/core/quranLearn.js"]` (K-P: değişen dosya K3P-27'de tek seferde yükseltilir).
- **Kanıt:** kaynak/headless ve sentetik veri. Tarayıcı, gerçek hesap, kişisel veri deposu, görsel QA veya cihaz kabulü yok.

## K3P-17 ne yaptı

- Yeni görev türü `kind:'build'` (TASARIM §4, R3). Çipler: kelimenin harekesiz harfleri (hedef) + biçimce en yakın **2 çeldirici** harf. Çeldirici, kelimede geçmeyen ve hedefle **aynı nokta ailesinden** (S0 şekil aileleri; aile bilgisi mevcut `kaoS0LessonOfLetter`'dan) seçilir; eşitlikte kimliğe göre kararlı sıralanır.
- Cevap yolunda yeni handler yok: mevcut `kaoAnswer` çoklu seçim + `ui.kaoOrderDraft` yolu kullanılır. Hedef harf sayısı = çip − 2; fazla/eksik seçim beklemede kalır. Doğru sıra, **harekeli cevabın harekesiz harfleridir** (`kaoOrderLabels` build yolunda `task.answer`'dan türetir; çipler sıra numarası taşımaz).
- Notlama mevcut `kaoGrade`/FSRS yolundan geçer; dizilim hatası `errors.order` kovasına yazılır (dizme sınıfıyla aynı hata sınıfı).
- **Geri bildirim** kelimenin harekeli hâlini gösterir (`answer` alanı harekeli; Arapça RTL satırı).
- Uygunluk: yalnız **2–6 harfli**, harfleri donmuş ses modülünde bulunan ve `verified` lemma; aksi hâlde kurucu `null` döner ve kart **R2**'ye düşer. B kolu R1'de kalır; R4 K3P-18'in işidir.
- Erişilebilirlik: çipler mevcut Arapça yolundan geçer; erişilebilir ad `glif, okunuşu <donmuş okunuş>` (harfin adı donmuş modülde yok; S0 alıştırmasının ölçüsü kullanıldı).
- Yeni test `tests/kao/test_k3p_build.js` (7 kontrol): uygunluk, bağımsız yazılmış aile çeldiricisi, sıra, doğru/yanlış sıra (gerçek `kaoAnswer` + FSRS + `errors.order`), çeldirici seçiminin sırayı bozması, a11y (`aria-label`), merdiven (yalnız R3/A + determinizm). KAO envanteri 74 → **75**.
- Paylaşılan fixture'lar güncellendi: `test_k3p_ladder` (R3 artık build, R4→R2), `kao-harness.playLesson` (build cevap yolu; `answer(task)` görev başına bir kez), `cift-sik.cjs` (build sayımı + deterministik R3 örneği).

## Ölçü panosu

| Ölçü | Şimdi | Tavan/hedef |
| --- | --- | --- |
| Runtime gzip L6 (bağlayıcı) | 127,995117 KiB (131067 B) | 128 KiB; kalan **5 B** |
| Runtime gzip L9 (perf aracı) | 127,623047 KiB | 128 KiB; kalan 386 B |
| CSS gzip L9 | 15,273 KiB | 16 KiB |
| İçerik | 184,591 KiB | 256 KiB |
| App.kao* | 45 | 45 |
| app.js / sync.js / state.js | değişmedi | veri ve migration korunur |
| KAO fixture envanteri | 75 | 75 PASS |
| `build` görevi (R3 örneği) | 26 kart → 6 build | kurulamayan uygun olmayan lemmalar R2'ye düşer |
| R3 örneği `cift-sik` | 0 çift şık | 0 |

## Kapılar ve açık sınırlar

- **`node kao3-premium/araclar/kapi-hizli.mjs --kart K3P-17 --yavas`** ve tüm aile taraması koşuldu: tests/kao 75 · app 78 · panel 23 · panel-v2 27 · quran 9 · reminders smoke · driver · zikr PASS; `cift-sik` ve `okunus-denetim` PASS. Tek kırmızı `tests/app/test_asset_pin_freshness.js` idi; `app/core/quranLearn.js` `pinDeferral.files`'a eklendi ve test **ERTELENDİ** diyerek PASS verdi (K-P kuralı; pin K3P-27'de yükseltilir).
- Hiçbir kabul kontrolü kaldırılmadı veya gevşetilmedi. Paylaşılan fixture düzeltmeleri kapsam içinde beyan edildi (aynı doğrulama yolunun parçası).
- **Runtime tavanı yükseltilmedi.** Kalan pay 5 B'dir; bu kartta aynı işi gören eski kod silinerek yer açıldı (yorum kısaltma, gereksiz ara alan/yardımcı kaldırma, mevcut render/okunuş yollarının yeniden kullanımı). Sonraki ölçü-kapı ekleyen kart için bütçe yoktur; gerekirse §5 gereği durulur veya kullanıcı yetkisiyle yükseltilir.
- Görsel QA (`KAO_QA_CHROME`), gerçek ekran okuyucu turu, hedef cihaz kabulü ve Tezhip görsel denetimi açık kalır (K3P-26).
- `cift-sik` ders taramasındaki tohumlu kullanıcı `s=40` (R4 bandı) olduğu için R3 görevini hiç üretmez; R3 ayrı ve sabit bir örnekle ölçülür (karta bağlı sayım FSRS yeniden planlamasıyla şişerdi).

## Devir notu

Yalnız K3P-17 uygulandı ve yerel commit atıldı; yayın/pin yok. Sıradaki K3P-18 için ayrı kullanıcı isteği gerekir. Kişisel veri/gerçek hesap tarayıcısı açma; `mustafaras/seyma-data` kapsam dışıdır.
