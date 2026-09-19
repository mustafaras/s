# Gate ayrıntıları

Genel şablona ek `details` alanı aşağıdaki minimum bilgileri taşır. Bu değerler yalnız gerçek sonuçla doldurulur; checker alanları doğrular, değerlendirmenin doğruluğunu insan reviewer denetler.

| Gate | details zorunlu alanları |
|---|---|
| scope | `changedFiles` dizi, `scopeReviewedBy` |
| requirements | `results` dizi; her satır `requirementId`, `testId`, `result=pass` |
| review | `findings` dizi, `openCritical=0`, `openHigh=0`, `reviewedBy` |
| source | Genel commands dizisi: gerçek komut ve exitCode=0 |
| visual | `themes`, `viewports`, `syntheticDataset`, `artifactKind` (prototype/render), `observations` |
| content | `contentIds`, `rightsEvidence`, `domainReviewer`, `decision=approved` |
| data | `schemaDecisionId`, `migrationEvidence`, `conflictEvidence`, `rollbackEvidence` |
| offline | `manifestEvidence`, `privateCacheExclusionEvidence`, `interruptionEvidence` |

`*Evidence` alanları plan kökünden var olan dosya yollarıdır. Content rightsEvidence de dosya yoludur; kişisel kişi/veri değil yetki sonucu ve kaynak kaydı taşır. IIP-02 visual prototype olabilir; üretim görsel kartlarında artifactKind=render olmalı. Görsel/cihaz kanıtı aynı değildir.

IIP-19 data gate tasarım kabulüdür: migration/conflict/rollback kanıtları onaylı senaryo ve şema analiz dosyaları olabilir; çalıştırılmış migration testi iddiası oluşturmaz. IIP-20/21 için aynı alanlar gerçek sentetik uygulama testi sonuçlarını gerektirir.
