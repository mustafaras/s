# KAO Kapanış — Ek 1 (denetim ve düzeltme programı)

**Tarih:** 2026-09-27 · **Yazan kart:** KAO-FIX-16 · **Ek türü:** addendum.
[KAO-KAPANIS.md](KAO-KAPANIS.md), eski `KAO-STATE.json`, eski `.anti-amnesia/**` ve `evidence/**`
**değiştirilmedi** (V8). Bu ek, kapanış belgesinin aşağıda adı geçen ifadelerini günceller.
Kanıt düzeyleri ayrıdır: kaynak/fixture ≠ yayın ≠ cihaz kabulü.

## 1. Denetim özeti
[KAO-UYGUNLUK-DENETIMI-20260926.md](KAO-UYGUNLUK-DENETIMI-20260926.md) kapanıştan sonra planı
koda karşı satır satır denetledi: 1 kritik (K-1: kısa sûre/Fâtiha anlamlarında kopya), 4 yüksek (Y-1…Y-4),
11 orta (O-1…O-11) ve 6 düşük (D-1…D-6) bulgu. Düzeltmeler ayrı bir programda, sıralı kartlarla yapıldı:
[duzeltme/](../duzeltme/BAGLAM-YONETIMI.md) (dal `kao-duzeltme`; durum
[CURRENT-STATE](../duzeltme/.anti-amnesia/CURRENT-STATE.md)).

## 2. Bulgu → düzeltme kartı

| Bulgu | Kart | Commit | Özet |
|---|---|---|---|
| O-4 | KAO-FIX-01 | `0d54321` | dondurma pini + yeniden üretim testi |
| K-1, Y-3 | KAO-FIX-02…04 | `1ff09b1` … `0ac1837` | 837 satırlık çalışma kitabı; kopya 618→0, İngilizce 26→0 |
| Y-4, D-6 | KAO-FIX-05 | `b1d081c` + `2ad2a4c` | şeddeli başlık ve DİA çift yazımı 26→0; D-6 belgeli istisna |
| Y-2 | KAO-FIX-06 | `7ef9f6e` | iki yönlü kart (sim 365 g: 524/524 lemma iki yönde) |
| Y-1 | KAO-FIX-07 | `70b7dbc` | bilinen = iki yönde review ∧ s≥21 |
| O-1 | KAO-FIX-08 | `f021e8a` | önceki çeldiriciler cevapta yazılır, lemma düzeyinde dışlanır |
| O-2 | KAO-FIX-09 | `5413819` | KF-10: `daily` budanmaz, 100 KB durum sınırı kaldırıldı |
| O-3 | KAO-FIX-10 | `5ccf5db` | kilometre taşı denetimi; 4 taş sim'de kazanılıyor |
| O-5 | KAO-FIX-11 | `6f2726b` + `b6754ff` | mutasyon yoklaması 17/17 |
| O-6 | KAO-FIX-12 | `7a1ee1e` | E7 kaynaklar bölümü |
| O-9 | KAO-FIX-13 | `a7b6ffe` | Arapça plan yazı tipi yığını (cihaz bekliyor) |
| O-7 | KAO-FIX-14 | `5330698` | R-A5 anlam komşuları doğrulanmış sözlükten |
| D-2, D-5 | KAO-FIX-15 | `cbeef96` | serpiştirme gramer dahil (KF-9), soldurma s≥30, kognat hata sınıfı |
| O-8, D-1, D-3 | KAO-FIX-16 | bu ek | plan/belge hizası (05 §1/§2/§5/§6, 06 §5, 02 §2.4, README) |
| O-11 | KAO-FIX-17 | — | plan-check sertleştirme (sırada) |
| D-4 | KAO-FIX-18 | — | sahipsiz plan maddeleri kararı (KF-6) |
| O-10 | — | — | KAO kusuru değil; denetim sırasında `58e0ceb` ile kapandı (kayıt amaçlı) |

## 3. O-8 · Bütçeler (KF-2, ölçüm 2026-09-27)
- `app/core/quranLearn.js` 1.857 satır (tavan 1.900) · `app/kao.css` 40.209 B (tavan 42 KB).
- Sözlük 324.328 B (tavan 340 KB, KAO-15 kararı); dört modül ham 472.696 B (tavan 480 KB).
- Gzip dört modül 162.177 B > 130 KB (R-C5): **karar kullanıcıda** (KAPANIŞ §6.1); fixture büyüme tavanı 160 KiB.
- Bölme (quranLearn.js, içerik) sonraki programa bırakıldı. Belgeler: 05 §1, 06 §5.

## 4. D-1 · Belge tutarsızlıkları
- README "Üretim kodu 0/0" → kapanış ve düzeltme programı durumu.
- 05 §5 "FSRS-4.5 vektörü" → ts-fsrs v4.5.2 varsayılan parametreleri (FSRS-5, 19 sayı).
- 02 §2.4 "12–16 görev" tipik hedef; bağlayıcı sınırlar 05 §6 (KF-4).
- 05 §2: kısa anahtarlar uygulanmadı; `daily` budanmaz (KF-10), `calibTotals` gerekmedi.
- Açık kararlar (eski CURRENT-STATE "yok" diyordu): gzip bütçesi (§6.1), cihaz kabulü K3 (§6.2),
  `eighty` taşı — içerik token kapsamı tavanı %77,42 < %80, taş mevcut içerikle kazanılamaz; eşik/ölçü
  hizası kararı kullanıcıda (kod değişmedi).

## 5. D-3 · Vakıf işaretleri (KF-5)
1.563 sözlük örneğinin 377'sinde vakıf/durak işaretleri sadeleştirilmiş; işaretler çıkarılınca 1.563/1.563
Tanzil ile birebir. **Karar (KF-5, varsayılan):** sadeleştirme kabul; D-02 "yalnız kesilir" ilkesine not
olarak düşülür. Kur'an okuyucusu (R-A6) işaretleri korur.

## 6. Yayın kaydı (D-1, PUB-2)
Kapanıştan sonra `7693528` 2026-09-26 15:03'te `origin/main`'e push edildi; bu push eski LEDGER'da ve
`releaseApprovalRecord`'da yoktu. Kaynak komut ve çıktısı:

```
$ git reflog show --date=iso origin/main | grep 7693528
7693528 refs/remotes/origin/main@{2026-09-26 15:03:34 +0300}: update by push
```

Düzeltme programının yayınları kullanıcı onayıyla her karttan sonra `main`'e ff edildi; son kayıt
`cbeef96` (KAO-FIX-15, Pages run 36317350133 success, pin `20260926m`). Ayrıntı: düzeltme LEDGER'ı.

**Geçersiz kılınan ifade:** KAPANIŞ §1 "Sonraki commit'ler `kuran-ogreniyorum` dalında, **yayın bekliyor**"
bu ekle geçersizdir — o commit'ler `7693528` ile yayına alındı.
