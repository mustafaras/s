# REPO-M001 — Tarihsel Markdown Taşıma Makbuzu

**Tarih:** 2026-08-02
**Durum:** `completed` — tüm doğrulama kapıları geçti
**Kapsam:** Yalnız üç tarihsel prompt/denetim belgesi
**Runtime etkisi:** Yok
**Kullanıcı verisi:** Okunmadı/yazılmadı

## Taşınan dosyalar

| Önceki yol | Canonical yeni yol | Önce SHA-256 | Sonra SHA-256 | Satır |
|---|---|---|---|---:|
| `KURAN-YOLCULUGU-YENI-OTURUM-PROMPTU.md` | `docs/prompts/legacy/KURAN-YOLCULUGU-YENI-OTURUM-PROMPTU.md` | `b9fb7786fb16df09252b9fbefcea6f354747b60ff934479b75de06d3f3833695` | `b9fb7786fb16df09252b9fbefcea6f354747b60ff934479b75de06d3f3833695` | 225 |
| `ZIKIRMATIK-IPHONE16-PREMIUM-PROMPT-PAKETI.md` | `docs/prompts/legacy/ZIKIRMATIK-IPHONE16-PREMIUM-PROMPT-PAKETI.md` | `6e6ef580b1b15c9bbf13ef2f8cc436a55fe32f288c9203db95e858798f1988d1` | `6e6ef580b1b15c9bbf13ef2f8cc436a55fe32f288c9203db95e858798f1988d1` | 843 |
| `ZIKIRMATIK-REDESIGN-DENETIMI.md` | `docs/audits/ZIKIRMATIK-REDESIGN-DENETIMI.md` | `1b855bf4c1613dcb5b0bd82a3bd977d6880333c37b192ca0ba0052e531dcd09c` | `1b855bf4c1613dcb5b0bd82a3bd977d6880333c37b192ca0ba0052e531dcd09c` | 321 |

Hash eşleşmesi, taşıma sırasında belge byte’larının değiştirilmediğini
kanıtlar. Belgelerin içindeki tarihsel düz metin dosya adları bilerek
değiştirilmedi; bunlar geçmiş oturum kanıtıdır, güncel Markdown linki değildir.

## Link güncellemesi

- `ZIKIRMATIK-GELISTIRME-PLANI.md` içindeki prompt bağlantısı yeni canonical
  yola alındı.
- `docs/README.md` tarihsel belge listesini yeni yollarla gösteriyor.
- `AGENTS.md` içindeki tarihsel handoff adları değiştirilmedi; geçmiş kayıt
  bütünlüğü korundu.

## Veri ve runtime güvenlik kontrolü

- `app.js`, `sync.js`, `panel.html`, `styles.css`, `index.html` değişmedi.
- `data/`, localStorage, `seyma-data`, GitHub API ve ağ çağrısı kullanılmadı.
- Browser/server açılmadı.
- Commit, push, merge veya deploy yapılmadı.

## M1 kabul kapısı

- [x] Üç hedef dosya önceden hash/line-count ile kaydedildi.
- [x] Dosyalar yalnız belirlenen `docs/` dizinlerine taşındı.
- [x] Son hash’ler önceki hash’lerle birebir eşleşiyor.
- [x] Güncel linkler yeni canonical yolları gösteriyor.
- [x] Tam Markdown link/whitespace taraması; yalnız önceden var olan
  `seyma_motivation_v2_package/README.md` hedefi kaldı.
- [x] `git diff --check`, `node --check app.js`, `node --check sync.js` ve
  `test_faz11_panel.js` (50/50).
- [x] Paired ledger’da `REPO-M001` satırlarının kapanması.

**M1 sonucu:** `completed`; runtime ayrıştırması (`REPO-L001`) bu fazın
kapsamında değildir ve otomatik başlamaz.
