# Şeyma Repository Documentation Index

Bu index, kökte tarihsel olarak birikmiş Markdown belgelerini ve yeni
panel/ÆON çalışma paketini tek bir okuma sırasına bağlar. Operasyonel kök
dosyalar (`AGENTS.md`, `CLAUDE.md`) ve yaşayan roadmap’ler geriye dönük
referansları bozulmaması için kökte bırakılmıştır.

## Zorunlu başlangıç sırası

1. [`AGENTS.md`](../AGENTS.md) — veri güvenliği, çalışma ve handoff kuralları.
2. [`CLAUDE.md`](../CLAUDE.md) — mimari ve doğrulama ayrıntıları.
3. [`GELISTIRME-PLANI.md`](../GELISTIRME-PLANI.md) — canlı roadmap ve teknik ilkeler.
4. İlgili ürün roadmap’i:
   - [`SEYMA-V2-PLAN.md`](roadmaps/SEYMA-V2-PLAN.md)
   - [`ILHAM-IBADET-GELISTIRME-PLANI.md`](roadmaps/ILHAM-IBADET-GELISTIRME-PLANI.md)
   - [`KURAN-YOLCULUGU-GELISTIRME-PLANI.md`](roadmaps/KURAN-YOLCULUGU-GELISTIRME-PLANI.md)
   - [`ZIKIRMATIK-GELISTIRME-PLANI.md`](roadmaps/ZIKIRMATIK-GELISTIRME-PLANI.md)
5. İlgili prompt/denetim paketi.

Yeni oturum için güncel, kanıt bağlı başlangıç dosyası:
[`NEW-SESSION-STARTER-REPO-PANEL.md`](NEW-SESSION-STARTER-REPO-PANEL.md).

## Kök belgelerin sınıfları

### Operasyonel ve değişmez referanslar

- `AGENTS.md`
- `CLAUDE.md`

Bu dosyalar kökte kalır. Tarihsel handoff gövdesi artık
[`docs/archive/AGENTS-HANDOFF-LOG.md`](archive/AGENTS-HANDOFF-LOG.md) içinde
append-only olarak tutulur; güncel kurallar ve arşiv linki kökte korunur.

### Yaşayan ürün roadmap’leri

- `GELISTIRME-PLANI.md`
- [`SEYMA-V2-PLAN.md`](roadmaps/SEYMA-V2-PLAN.md)
- [`ILHAM-IBADET-GELISTIRME-PLANI.md`](roadmaps/ILHAM-IBADET-GELISTIRME-PLANI.md)
- [`KURAN-YOLCULUGU-GELISTIRME-PLANI.md`](roadmaps/KURAN-YOLCULUGU-GELISTIRME-PLANI.md)
- [`ZIKIRMATIK-GELISTIRME-PLANI.md`](roadmaps/ZIKIRMATIK-GELISTIRME-PLANI.md)

Bunlar ürün kararlarının ve uygulama fazlarının canonical belgeleridir;
M2 ile `docs/roadmaps/` altında tek kaynak olarak tutulurlar.

### Tarihsel/özellik bazlı prompt ve denetim belgeleri

- [`KURAN-YOLCULUGU-YENI-OTURUM-PROMPTU.md`](prompts/legacy/KURAN-YOLCULUGU-YENI-OTURUM-PROMPTU.md)
- [`ZIKIRMATIK-IPHONE16-PREMIUM-PROMPT-PAKETI.md`](prompts/legacy/ZIKIRMATIK-IPHONE16-PREMIUM-PROMPT-PAKETI.md)
- [`ZIKIRMATIK-REDESIGN-DENETIMI.md`](audits/ZIKIRMATIK-REDESIGN-DENETIMI.md)

Bu dosyalar M1 kapsamında kökten çıkarılıp tarihsel dizinlerine alındı;
byte/hash bütünlükleri korunuyor. Yeni panel çalışmalarında canonical prompt
sırası aşağıdaki `docs/panel/` paketidir.

## Panel canonical paketi

- [`docs/panel/README.md`](panel/README.md) — okuma sırası, anti-amnesia ve ledger sözleşmesi.
- [`docs/REPO-ORGANIZASYON-VE-MODULERLESTIRME-PLANI.md`](REPO-ORGANIZASYON-VE-MODULERLESTIRME-PLANI.md) — kök Markdown ve uzun runtime dosyalarını güvenli ayırma planı.
- [`docs/REPO-M0-MARKDOWN-MANIFEST.md`](REPO-M0-MARKDOWN-MANIFEST.md) — M0 belge envanteri ve link kanıtı.
- [`docs/REPO-L0-RUNTIME-DEPENDENCY-MAP.md`](REPO-L0-RUNTIME-DEPENDENCY-MAP.md) — L0 runtime giriş/bağımlılık haritası.
- [`docs/REPO-M1-MARKDOWN-MOVE-RECEIPT.md`](REPO-M1-MARKDOWN-MOVE-RECEIPT.md) — M1 tarihsel belge taşıma hash/link makbuzu.
- [`docs/REPO-M2-ROADMAP-MOVE-RECEIPT.md`](REPO-M2-ROADMAP-MOVE-RECEIPT.md) — M2 yaşayan roadmap taşıma makbuzu.
- [`docs/REPO-M3-AGENTS-HANDOFF-RECEIPT.md`](REPO-M3-AGENTS-HANDOFF-RECEIPT.md) — M3 handoff arşivleme makbuzu.
- [`docs/REPO-L1-PANEL-SPLIT-RECEIPT.md`](REPO-L1-PANEL-SPLIT-RECEIPT.md) — L1 panel CSS/JS ayrıştırma makbuzu.
- [`docs/REPO-L2-CONSTANTS-RECEIPT.md`](REPO-L2-CONSTANTS-RECEIPT.md) — L2-a app sabit/ikon ayrıştırma makbuzu.
- [`docs/REPO-L2-STATE-BOUNDARY-RECEIPT.md`](REPO-L2-STATE-BOUNDARY-RECEIPT.md) — L2-b state/migrate sınır ve fixture makbuzu.
- [`docs/REPO-L2-B1-STATE-HELPER-RECEIPT.md`](REPO-L2-B1-STATE-HELPER-RECEIPT.md) — B1 read-only helper/dependency-bag kanıtı.
- `.claude/skills/run-seyma/verify-state-helper-boundary.mjs` — B1 read-only
  helper/dependency-bag fixture; runtime state taşıması değildir.
- [`docs/REPO-L2-B2-MIGRATION-PARITY-RECEIPT.md`](REPO-L2-B2-MIGRATION-PARITY-RECEIPT.md)
  — B2 sentetik black-box migration parity kanıtı.
- `.claude/skills/run-seyma/verify-state-migration-boundary.mjs` — B2
  sentetik migration fixture’ı; gerçek persistence/sync değildir.
- [`docs/REPO-L2-B3-ADAPTER-SCRATCH-RECEIPT.md`](REPO-L2-B3-ADAPTER-SCRATCH-RECEIPT.md)
  — B3 dependency-bag adapter scratch sözleşmesi.
- `.claude/skills/run-seyma/verify-state-adapter-contract.mjs` — B3 contract
  harness; production state/persistence graph’ına bağlı değildir.
- [`docs/ledgers/`](ledgers/) — repo organizasyonu için paired Operations/State ledger’ları.
- [`docs/panel/plans/`](panel/plans/) — araştırma ve tasarım planları.
- [`docs/panel/prompts/`](panel/prompts/) — tek aşamalı, dur-kontrol et mantığında prompt’lar.
- [`docs/panel/ledgers/`](panel/ledgers/) — eşli, sequence-aligned, append-only ledger’lar.

## Belge düzenleme kuralları

1. Yeni panel kapsamı önce `docs/panel/plans/` içinde planlanır.
2. Uygulanabilir her fazın bir prompt dosyası olur.
3. Prompt dosyası ancak ilgili ledger kaydı hazırsa çalıştırılır.
4. Ledger’lar geçmiş satırları değiştirmeden yalnızca sona eklenir.
5. Kök roadmap’ler ile prompt paketleri arasında karar çelişkisi varsa çalışma
   durdurulur ve önce kullanıcı kararı alınır.
6. Uygulama, commit, push, merge veya deploy izni prompt dosyasından çıkarılamaz;
   kullanıcı ayrıca açıkça yetkilendirmelidir.
