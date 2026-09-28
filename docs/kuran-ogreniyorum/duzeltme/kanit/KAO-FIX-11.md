# KAO-FIX-11 · Kanıt (O-5 test kör noktaları)

**Tarih:** 2026-09-26 · **Dal:** `kao-duzeltme` · **Kanıt düzeyi:** test + mutasyon (üretim kodu değişmedi)

## Yeni testler (üretim kodu değişmedi; hepsi PASS)
| Test | Dosya | Koruduğu |
|---|---|---|
| Günlük yeni sınırı: 40 yeni aday (türler dönüşümlü), `dailyNew` 5/10/15 → `isNew` tam 5/10/15 | `test_kao_queue.js` | M09 |
| Undo `errors`: gramer görevi (`errorClass`) yanlış → +1 → `kaoUndo()` → `errors` bit-bit eski | `test_kao_requirements.js` | M04 (R-C3) |
| Oturum içi tekrar (02 §2.10): yanlış → sonda tek `:retry`, sıradaki görev; retry de yanlış → ikinci yok | `test_kao_requirements.js` | M16/M17 |

## Mutasyon (çalışma ağacı kopyası, `$TMPDIR/kao-mut-fix11`)
| | Önce | Sonra |
|---|---|---|
| M01–M15 | 13/15 (M04, M09 KAÇTI) | **15/15** |
| + M16 "tekrar yok", M17 "tekrar sınırsız" (yeni, FIX-11) | — | YAKALANDI |
| **Toplam** | | **17/17** |

## Yeni bulgu (üretim kodu değişmedi → kullanıcı kararı)
Kökü olmayan işlev kelimelerinde kelime görevi **yanlış seçeneksiz**: boş veride `P`, `ACC`, `COND`, `NEG`, `DEM`, `CONJ`, `REL`, `INC`, `ANS`, `EXL`… türlerinde 0 çeldirici (lemma×yön ≈ 98); `T`, `LOC`, `INTG` 2 çeldirici. Neden: sözlük yedeğindeki `lemma.root!==meta.root` süzgeci iki tarafta da kök `undefined` iken tüm adayları eler (kökü olmayan lemma 65/524). Retry testi bu nedenle isim lemmasıyla kuruldu. Tuzak 17.

## Olay kaydı (dürüstlük)
Mutasyon komut zincirinde `node --check` başarısız olunca `M` ataması atlandı ve `rsync -a --delete ./ "$M/"` **hedef `/`** ile koştu. Sandbox yazmayı repo/`$TMPDIR`/`/tmp` ile sınırlıyordu; rsync "unexpected end of file" ile düştü. Hasar denetimi: izlenen dosyalarda silme yok (`git ls-files -d` boş), git dışı girdiler hash'le doğrulandı (QAC `a1d129…`, referans `2ee7ca…`), `files/yedek`, `.superpowers`, bellek, karalama ve `$TMPDIR` dizinleri yerinde, freeze-repro PASS; günlükte silme denemesi 0. Belirsiz: `~/.claude/debug` yok (önceden var olduğu kanıtlanamıyor; hata ayıklama günlüğü, gerekirse yeniden oluşur). Önlem: `--delete` hedefi artık `case`/`[ -d ]` ile doğrulanıyor.

## Kontroller
| Komut | Sonuç |
|---|---|
| `for f in tests/kao/*.js` | 17/17 exit 0 |
| `node --check kao-mutate.mjs` · mutasyon | 0 · 17/17 |
| `app/`, `index.html`, `sw.js`, pin | değişmedi |
