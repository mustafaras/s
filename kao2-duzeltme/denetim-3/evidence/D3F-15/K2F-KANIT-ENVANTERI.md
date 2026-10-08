# K2F KANIT envanteri (denetim-3 F-15)

Bu dosya `k2f-kanit-envanteri.mjs --write` çıktısıdır; elle düzenlenmez. Ölçüm kümesi aracın `--audit-k2f` kümesidir:
`07802fa6..cbe0d604` aralığında commit'i olan K2F prompt'ları. Bölüm listesi `kao2-duzeltme/denetim-2/tools/d2f-sync-check.mjs` `KANIT_SECTIONS` sabitinden okunur.

## Özet
- 44 KANIT. 43 tanesinde `Oturum:` satırı yok; satır yalnız K2F-43 dosyasında var.
- 7 tanesinde 8 bölümden en az biri eksik (başlık birebir `## <bölüm>` olarak aranır).
- Tarihsel kayıtlar değiştirilmez: oturum kimliği sonradan uydurulamaz, eksik bölüm geriye dönük yazılmaz.

## Bölümü eksik KANIT'lar
| Prompt | Eksik bölüm | Dosyadaki ## başlıkları |
|---|---|---|
| K2F-18 | TDD, Ölçümler, Bilerek değişen testler | İlerleme günlüğü · Yapılan · Kapılar (P3) · Kanıt düzeyleri · Sürprizler / sonraki promptlara not |
| K2F-22 | Yapılan, Ölçümler, Sürprizler | Onay kaynağı (dürüstlük notu) · İlerleme günlüğü · Ölçüm (texts.tr.json, araçla) · TDD · Kapılar (P3) · Bilerek değişen testler · Kanıt düzeyleri · Açık kalanlar / sonraki promptlara not · Ek iş (K2F-23 öncesi) — açık işlerin kapatılması · LEDGER seq 65 |
| K2F-30 | Ölçümler | İlerleme günlüğü · Yapılan · TDD · Kapılar (P3) · Bilerek değişen testler (eski beklenti → yeni beklenti · gerekçe) · Kanıt düzeyleri · Sürprizler / sonraki promptlara not · Bağımsız inceleme (code-reviewer): APPROVE · CRITICAL/HIGH 0, MEDIUM 1, LOW 3 |
| K2F-31 | Ölçümler | İlerleme günlüğü · Yapılan · TDD · Kapılar (P3) · Bilerek değişen testler · Kanıt düzeyleri · Sürprizler / sonraki promptlara not · Bağımsız inceleme (code-reviewer): ilk WARNING → düzeltildi |
| K2F-33 | Ölçümler, Bilerek değişen testler | İlerleme günlüğü · Yapılan · TDD · Kapılar (P3) · Kanıt düzeyleri · Sürprizler / sonraki promptlara not |
| K2F-41 | Yapılan, TDD, Kapılar, Bilerek değişen testler | İlerleme günlüğü · Ölçümler · Kanıt düzeyleri · Sürprizler |
| K2F-42 | Yapılan, TDD, Kapılar, Bilerek değişen testler, Sürprizler | İlerleme günlüğü · Ölçümler · Kanıt düzeyleri |

## `Oturum:` satırı olmayan KANIT'lar
K2F-00, K2F-01, K2F-02, K2F-03, K2F-04, K2F-05, K2F-06, K2F-07, K2F-08, K2F-09, K2F-10, K2F-11, K2F-12, K2F-13, K2F-14, K2F-15, K2F-16, K2F-17, K2F-18, K2F-19, K2F-20, K2F-21, K2F-22, K2F-23, K2F-24, K2F-25, K2F-26, K2F-27, K2F-28, K2F-29, K2F-30, K2F-31, K2F-32, K2F-33, K2F-34, K2F-35, K2F-36, K2F-37, K2F-38, K2F-39, K2F-40, K2F-41, K2F-42
