# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-12
lastSeq: 44
status: active
-->

Son güncelleme: 2026-09-29 · LEDGER seq44

## Şu an neredeyiz
KAO2-00…11 tamamlandı (12/28); **W2 kapandı** ve G1 ara özeti sunuldu (seq44, bilgi amaçlı). KAO2-11 ilk açılış + yerleştirme yerelde commit edildi (seq43), **yayında değil** (releaseApproval KAO2-10'a kadar). Dokun dışı iki pin dosyası ve dört KAO testi kullanıcı onayıyla güncellendi (seq42). Bağımsız code-reviewer onay verdi; tek LOW bulgu (eksik içerikte sınanmadan S0 işaretleme) düzeltildi. Son canlı KAO yayını KAO2-10 (`811ebc88`, Pages run 36534605512). Son canlı yayın İlham ortak kart dili (`5aaa6168`, run 36537983076).

## Sıradaki kartın tek cümlesi
KAO2-12: Ders oynatıcı (S-05) — `lessonPlan` (Tanış → Kavram → Pekiştir → Uygula → Özet), `App.kaoLesson` (+1 handler → 40, fx2 pinleri), A-1: sıfır kullanıcı 3 dokunuşta `intro`; `daily`/`s0-lesson`/`mastery` ve ilk açılışın son düğmesi derse bağlanır.

## Canlı gerçekler
- İlk açılış (KAO2-11):
  - kartsız ve `onboarding.doneAt` boş kullanıcıda `kaoOpen()` ana ekranın yerine 3 adım gösterir. Bu ayrı bir yığın görünümü değil, ana ekran modudur (`ui.kaoOnboard`; Flow görünüm listesi değişmedi);
  - yerleştirme kapı görevlerinin alt kümesidir (8 okuma + 4 dinleme); ≥7/8 → level1, aksi hâlde s0 ve yalnız eksik S0 dersleri (içerikten türetilir, s0.12 hep kalır, diğerleri `path.lessons[id].via='placement'`; içerik eksikse hiçbiri işaretlenmez);
  - Atla: level1 / 5 dk / ses açık;
  - veri yalnız Bitir/Atla'da tek kayıtla yazılır; `doneAt` doluysa hiçbir şey yazılmaz.
- Legacy (`doneAt='legacy'`): ilk açılış yok; "Yeni düzen" notu bir kez, `whatsNewAt` `kaoOpen`'da yazılır.
- Handler `App.kao*` = 39 (§4); App yüzeyi 760, işlev ataması 598, tıklama 393.
- İlham & İbadet ortak kart dili (seq41, styles.css `.saygi-page`): KAO hub bu yüzeyde altın şerit + ortak gölge + 44px rozet taşır (06 §5'ten bilinçli sapma).
- Hub kartı (İlham & İbadet): 05 §8 dört durum; halka gerçek ünite ilerlemesi; niyet önerisi yalnız "bekliyor"da ve hâlâ bir sonraki namaz vaktinden (seçilen niyet henüz bağlı değil); render veri yazmaz.
- Ana ekran: HeroCard (nextStep; tek `.kao-primary`) + Yolun + Keşfet + Sen.
- Eylem eşlemesi: daily/next-unit/warmup/night/mastery → kaoStart; **onboarding → kaoOnboard('start')**; s0 → kaoGate("start") (geçici, KAO2-12); rest → kaoOpenAyah.
- Motor: tekrar borcu >60 → yeni 0 ve ünite tanıtımı yok; 7+ gün ara → ısınma; sessionDone yalnız gündüz oturumu sonunda.
- Müfredat 12 ünite · 109 ders; S0 12 ders.
- Boyut: runtime gzip 66,258 KiB (≤80, pay 13,7), CSS 8,629 KiB (≤14), içerik 168,483 KiB (≤256), p95 ≈4,4 ms. Pin `20260928b` (quranPhonicsV1 `20260924b`); styles.css `20260929a`.
- P3: syntax 4/4, KAO 27/27, app 77/77, panel 23/23, panel-v2 27/27, Quran 9/9, reminders, driver, zikr 95/95, kontrast 460/0, apple 30/0, sync PASS. fx-coverage M1–M13 değişmedi.
- `KAO2-STATE.json`: KAO2-11 done, nextCard KAO2-12, ledger seq44, G1 presented, G2 closed, G3/G4 open, backlog 4 kayıt, releaseApproval approved_through_KAO2-10.

## Açık riskler
- S0 eylemi hâlâ geçici kapıya bağlı: "Henüz değil" diyen kullanıcı "Derse başla"da eski 20 maddelik okuma kapısını görür (KAO2-12 kapatır). Mastery eylemi geçici (KAO2-13).
- Flow görünüm beyaz listesi: yeni görünüm gerektiren kart (KAO2-12 ders oynatıcısı) `quranLearnFlow.js`'i Dokun listesine almalı ya da mod yaklaşımını kullanmalı.
- Runtime payı 13,7 KiB; KAO2-12 boyutu yakından izlenmeli.
- Eski ana ekran/hub CSS'i öksüz (B-KAO2-09-1, B-KAO2-10-1 → KAO2-26); daily.ms yazılmıyor (B-KAO2-08-1 → KAO2-12); niyet hub'a bağlı değil (B-KAO2-11-1 → KAO2-23).
- Pin korunduğu için çevrimdışı paketli cihazlar sw.js değişene kadar eski sürümü görür.
- Perf p95 kapısı soğuk başlangıçta ara sıra eşiği aşar (tekrar koşuda PASS; bilinen gürültü).
- Kaynak/test kanıtı cihaz kabulü değildir.

## Bekleyen kullanıcı işleri
- G1 ara özeti (bilgi amaçlı; yanıt gerekmez). İstenirse yerel görsel QA (CLAUDE.md kural 1, 127.0.0.1:9000).
- KAO2-11 yayını için açık onay (push + main fast-forward + Pages + canlı hash).
- KAO2-12'ye başlamak için açık "devam".
- Yayın sonrası gerçek cihazda ilk açılış ve ana ekran kabulü.
