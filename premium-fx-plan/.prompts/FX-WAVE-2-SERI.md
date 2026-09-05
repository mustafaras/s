# FX-WAVE-2 Serisi — Ajan Yürütme Sırası (FX-P-81…91)

**Amaç:** Bu dosya, ajanlara **sırayla** verilecek 10 prompt kartının indeksidir. Her ajan **yalnızca kendi kartını** okur; başka karta atlamaz.

## Seri Açılışı (İLK AJAN, FX-P-81'den ÖNCE, bir kez)

1. `git checkout -b premium-fx-gorsel-yuzey` (mevcut HEAD'den; kullanıcı (A) dalını seçtiyse).
2. `premium-fx-plan/.anti-amnesia/FX-PROMPT-STATE.json` → `lastCompletedPrompt: null`, `activePrompt: null`, `currentPhase: "FX-WAVE-2 Dalga 8 başlıyor"`, `series: "FX-WAVE-2"`, `implementationComplete: false`, `updatedAt: "<bugün>"`. Eski alanlar korunur.
3. Kart yoksa kartı bu indeksten üret (zaten üretildi).

## Yürütme Sırası

| Sıra | Kart | Tek satır özet | Önceki tamamlanmadan başlama |
|---|---|---|---|
| 1 | `FX-P-81.md` | Aurora arka plan katmanı | Seri açılışı |
| 2 | `FX-P-82.md` | Nav bounce + badge pop | FX-P-81 |
| 3 | `FX-P-83.md` | Surface hover/active + glass | FX-P-82 |
| 4 | `FX-P-84.md` | SeyOnSynced bell | FX-P-83 |
| 5 | `FX-P-85.md` | Splash dün-hatırlatma notu | FX-P-84 |
| 6 | `FX-P-86.md` | Ring + motivation bar shimmer | FX-P-85 |
| 7 | `FX-P-87.md` | voicePitch/voiceVoiceName UI + backfill | FX-P-86 |
| 8 | `FX-P-91.md` | Emoji-ikon temizliği (premium yüzeyler → icon() SVG) | FX-P-87 |
| 9 | `FX-P-89.md` | contain izole denemesi (opsiyonel, kullanıcı onaylı) | FX-P-91 |
| 10 | `FX-P-90.md` | Bağımsız denetim + seri kapanışı | 1–9 (FX-P-88 hariç) |

**FX-P-88 (hava modu) BU SERİDE UYGULANMAZ** — bloklu; kart yok.

## Her Ajanın Ortak Sözleşmesi (PROMPT-CATALOG §1'den kısaltma)

- Branch `premium-fx-gorsel-yuzey` olmalı; değilse dur ve kullanıcıya bildir.
- Başlangıç: `activePrompt: "FX-P-NN"` yaz. Bitiş: `lastCompletedPrompt: "FX-P-NN"`, `activePrompt: null`, `updatedAt`.
- Her prompt = tek yerel commit: `premium-fx: FX-P-NN <Türkçe açıklama>`. **PUSH/PR/MERGE/DEPLOY YOK.**
- Bitirmeden S5 (test) + S6 (değişmezlik) çıktılarını kanıt olarak LEDGER satırına yaz.
- `LEDGER.md` + `CURRENT-STATE.md` güncelle (S7).
- **K1 · Emoji-ikon yasağı:** Bu serinin eklediği/dokunduğu her yüzeyde (kart başlıkları, kontroller, badge, katmanlar, splash notu) emoji **ikon** kullanılmaz; ikon her zaman `icon('<lucide-adı>', boyut)` helper'ı ya da mevcut SVG/CSS amblem ile verilir. **İstisna (kapsam dışı):** Uygulamanın genel marka dilindeki metin-içi üslup emojileri (🦩 maskot, toast kapanışlarındaki ✨ vb.) bu seriye girmez; dokunulmaz. Emoji-ikon temizliğinin kendisi FX-P-91'dir. Kural ihlali = commit iptali.