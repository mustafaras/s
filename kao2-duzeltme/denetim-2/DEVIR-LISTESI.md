# Kapanış sonrası devir listesi (2026-10-07)

Claude'un kapatabildiği her şey kapandı. Aşağıdakiler gerçek bir insan, cihaz ya da kayıt gerektirir; kayıt olarak "tamam" yazılmadı.

## 1. `8bf8f658` — KAPANDI (karar: tutuldu)
Commit canlıdaki düzeltmeleri taşıyor (alt çubuk İlham etiketi, Arapça sekmesi, Raşit kartları, panel-v2 dar ekran). Geri alma bunları siler, yeni pin + yayın ister. Karar: **geri alınmaz**. Değişirse ayrı onayla `git revert 8bf8f658` + pin.

## 2. L2 dinî bağlam onayı (0/37) — uzman
Paket hazır: `docs/kuran-ogreniyorum/kao2/inceleme/INCELEME-KAO2-17.md` ve `INCELEME-KAO2-18.md` (37 satır, L2 kutuları). Uzman kutuları işaretler; sonra `node kao2-duzeltme/denetim-2/../tools/l2-paket-build.mjs` ile paket yenilenir. Claude işaretlemez.

## 3. Eşlenmeyen 13 namaz kelimesi — uzman
Liste: `docs/kuran-ogreniyorum/kao2/inceleme/NAMAZ-ESLEME-L2.md` ("Eşleşmeyen kelimeler"). 12'sinde aday yok, 1'inde (ʿabduhu) iki aday var. Uzman karar verirse eşleme araç girdisine eklenir; tahmin yok. Bu arada uygulamada **kapalı** başlarlar (`is-closed`; ekran okuyucuya "anlamı kapalı; dokununca açılır"); dokununca anlamları açılır (`is-revealed`). Ölçüm: denetim-3 `evidence/12-namaz-eslenmeyen.txt` (94/94 düğme çalışıyor). Düzeltme notu: denetim-3 F-13 (2026-10-08); eski metin "açık görünürler" diyordu.

## 4. Hece sesi kayıtları (K-3) — kayıt
Araç: `node tools/kao2-syllable-audio.mjs --inventory` (ne kaydedilecek), kayıtlar gelince `--check --source <dizin>`. Protokol: 48 kHz · 24 bit · mono · −18 LUFS · −1 dBTP · baş/son 150 ms sessizlik · hece başına 3 kayıt · ses sahibi lisansı. Kayıt gelmeden uygulama kademe B ile çalışır.

## 5. Cihaz kabulü (A-11/A-12) ve ekran okuyucu — sen
Canlı: https://mustafaras.github.io/s/ (pin 20261007b). Gerçek telefonda:
1. Uygulamayı aç, Kur'an Arapçası bölümüne gir; ilk 7 günde en az 4 gün dön. Her gün bir ders bitir.
2. İlk tekrarlarda doğru oranına bak (hedef ≥ %80). → A-11
3. Her açılışta "Şimdi ne yapmalıyım?" diye düşündüğün an oldu mu? Hedef: hiç olmaması. → A-12
4. Ekran okuyucu (iPhone VoiceOver / Android TalkBack): Bugün, ders oynatıcı, kelime detayı, İlerleme, Ayarlar. Sırayla gez; odak sırası, okunan etiket ve Arapça metnin okunuşu doğru mu, modal'dan Escape/geri ile çıkılıyor mu?
5. Sonucu bana yaz; A-KABUL.md ve kayıtlar senin sözünle güncellenir.
Not: "Verileri sıfırla"ya basma.
