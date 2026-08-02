# REPO-M002 — Yaşayan Roadmap Taşıma Makbuzu

**Tarih:** 2026-08-02
**Durum:** `completed` — tüm doğrulama kapıları geçti
**Kapsam:** Dört yaşayan ürün roadmap’i
**Runtime etkisi:** Yok
**Kullanıcı verisi:** Okunmadı/yazılmadı

## Taşınan dosyalar

| Önceki yol | Canonical yeni yol | Önce SHA-256 | Sonra SHA-256 | Değişiklik |
|---|---|---|---|---|
| `SEYMA-V2-PLAN.md` | `docs/roadmaps/SEYMA-V2-PLAN.md` | `589ba17a33bbd4b0f1dc64a36cff4a528bb95dcf5e7d5bda890901329f427494` | `589ba17a33bbd4b0f1dc64a36cff4a528bb95dcf5e7d5bda890901329f427494` | Sadece taşıma |
| `ILHAM-IBADET-GELISTIRME-PLANI.md` | `docs/roadmaps/ILHAM-IBADET-GELISTIRME-PLANI.md` | `e73ed9901950e764ca844f0d571bd65852f0fc0d029944a894bffc2bd7d77f76` | `e73ed9901950e764ca844f0d571bd65852f0fc0d029944a894bffc2bd7d77f76` | Sadece taşıma |
| `KURAN-YOLCULUGU-GELISTIRME-PLANI.md` | `docs/roadmaps/KURAN-YOLCULUGU-GELISTIRME-PLANI.md` | `dd2fb142885b3829cec4ff10e6a04021316da69a3586d6317bb57b4ec6901815` | `dd2fb142885b3829cec4ff10e6a04021316da69a3586d6317bb57b4ec6901815` | Sadece taşıma |
| `ZIKIRMATIK-GELISTIRME-PLANI.md` | `docs/roadmaps/ZIKIRMATIK-GELISTIRME-PLANI.md` | `919fabf90604b3354f387e2ed3a1794ca3eaf9988f7787c4486e7a30925f0b3e` | `cd1542b69d8ed17646feca326868cd8cd6cf9e84fe201d05a4e794e2779d19de` | Tek Markdown linki root’tan `../prompts/legacy/` yoluna düzeltildi |

Üç roadmap’in byte içeriği aynen korundu. Zikirmatik roadmap’inde yalnızca
taşınan dosya içindeki artık kırılacak olan prompt linki, yeni canonical
konuma göre düzeltildi; başka içerik değişmedi.

## Güncellenen güncel referanslar

- `GELISTIRME-PLANI.md` → İlham & İbadet roadmap’i.
- `docs/README.md` → dört roadmap’in `docs/roadmaps/` bağlantıları.
- `AGENTS.md` ve `CLAUDE.md` → güncel repository structure yolları.
- `docs/roadmaps/ZIKIRMATIK-GELISTIRME-PLANI.md` → legacy prompt bağlantısı.

Tarihsel handoff satırlarındaki eski dosya adları geçmiş kanıtı olduğu için
değiştirilmedi.

## Güvenlik ve kabul kapısı

- [x] Ön/son hash ve satır sayısı ölçüldü.
- [x] Dört dosya yalnız `docs/roadmaps/` altına taşındı.
- [x] Güncel linkler yeni canonical yolları gösteriyor.
- [x] Markdown link/whitespace kontrolü geçti; yalnız önceden var olan
  `AGENTS.md` içindeki eksik motivation paketi hedefi kaldı.
- [x] `node --check app.js`, `node --check sync.js` geçti.
- [x] `test_faz11_panel.js`: 50/50.
- [x] `git diff --check` geçti.
- [x] Runtime dosyaları, storage, `seyma-data` ve kullanıcı verileri
  değiştirilmedi.
- [x] Browser/server, commit/push/merge/deploy yapılmadı.

**M2 sonucu:** `completed`; M3 handoff arşivi ve L1 panel ayrıştırması bu
fazdan otomatik başlamaz.
