# K2F-38 — Denetim kontrolleri kalıcı fixture
Tarih: 2026-10-06 · Dal: claude/laughing-cori-o6ag6m (kao2-duzeltme içeriği) · Önceki commit: 1998f25 · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: (denetim kalıcılığı) + ek FIX: Seviye 0 örnek kelime satırı görsel kusuru · R değişimi: yok (10/10 PASS)

## İlerleme günlüğü
- [x] P1: sync PASS (38/44, seq 108), prompt in_progress
- [x] tests/kao/test_kao2_denetim.js yazıldı (10 kontrol, kao-harness): 10/10 PASS, ~60 sn
- [x] R-04 güçlendirildi (özgün betikte plan boştu; artık gerçek S0 oturumu "Aşama 1 / 4")
- [x] README satırı eklendi
- [x] Ek FIX (kullanıcı ekran görüntüsü): S0 "Örnek kelimeler" satırı — aşağıda

## Yapılan
- `tests/kao/test_kao2_denetim.js` (yeni): `tekrar-uret.cjs`'in 10 kontrolü, `kao-harness` ile; özet satırı "KAO2-38 denetim: PASS (10 kontrol)". Tarama boş geçmesin diye sayaç doğrulamaları (gramer görevi >0, çağrılan ad >20, ders >100).
- R-09: özgün (yığınsız atama) + gerçek `kaoNav` yolu birlikte sınanır.
- **Ek FIX (görsel):** kullanıcı Seviye 0 ders 1 "Dinle ve gör" aşamasının ekran görüntüsünü gösterdi: örnek kelime kutuları ~25 px daracık, okunuş harf harf alt alta kırılıyor, "Dinle" düğmesi kutunun üstüne biniyor. Kök neden iki katman: (1) `.kao-s0-listen{justify-items:center}` liste ızgarasını içeriğe daraltıyor; (2) genel `.kao-secondary{width:100%}` satırdaki `flex:0 0 auto` düğmeyi tam genişliğe çıkarıp kelime kutusunu eziyor. `app/kao.css`'te iki mevcut kural düzeltildi (yeni kural yok): `.kao-s0-words` `justify-self:stretch;width:100%`; kelime kutusu `flex:1 1 0;width:auto`; düğme `width:auto;padding:0 20px`.
- Koruma: `test_kao2_design_contract.js` +3 sözleşme (mutasyonla kırmızı görüldü: `width:auto` silinince "Dinle düğmesi içeriği kadar" kırıldı).
- Araç: `shoot-modal.mjs` S0 ders kimliği `KAO_QA_S0` ortam değişkeniyle seçilir (varsayılan s0.02, davranış aynı).

## TDD
- Kırmızı (CSS): ekran görüntüsü (önce) — kutu ~25 px, düğme taşıyor; sözleşme mutasyonu → `AssertionError: Dinle düğmesi içeriği kadar`
- Yeşil: `node tests/kao/test_kao2_design_contract.js` → PASS; `node tests/kao/test_kao2_denetim.js` → PASS (10 kontrol)
- Not: ilk CSS denemem (yalnız `flex:1 1 0` + ol genişliği) görüntüde daha kötüydü (düğme dışarı taştı); kök neden `.kao-secondary{width:100%}` ancak görüntüyle bulundu.

## Kapılar (P3)
Aşağıda kapilar.sh özeti (KAO2_ACCEPT_SLOW_HOST=1; makine yavaş).
tekrar-uret: 10/10 PASS (önceki 10/10)

## Ölçümler
- css gzip(9): 13,896 / 14 KiB (önce 13,872) · yeni handler yok: App.kao* 45 · yüzey 766 · atama 604
- Ekran görüntüleri (sentetik, yerel; cihaz DEĞİL): 390 px s0.01 önce/sonra; 320 px s0.01 sw=cw taşma yok; s0.05/.10/.11 aşama-2 temiz. Not: 7 derslik paralel çekimde 4'ü düştü (çakışma); s0.03/.07/.09/.12 ayrı çekilmedi.

## Bilerek değişen testler
- test_kao2_design_contract.js: yalnız ekleme (+3 sözleşme).

## Kanıt düzeyleri
- Kaynak/test ✓ · yerel görsel (390/320) ✓ · Yayın: yok · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- `tekrar-uret.cjs` R-04 özgün biçimde zayıftı (plan boş). Kalıcı testte düzeltildi.
- Aynı genel `.kao-secondary{width:100%}` başka flex satırlarında da tuzak olabilir; K2F-39 CSS temizliğinde taranmalı.
