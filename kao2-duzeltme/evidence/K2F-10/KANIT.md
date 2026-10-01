# K2F-10 — Gramer 2/3 — fail-closed güvenlik ağı
Tarih: 2026-10-01 · Dal: kao2-duzeltme · Önceki commit: 5098b0ba · Uygulayıcı: Claude Sonnet 5.5
Kapatılan bulgular: K4-02 (2/3) · R değişimi: R-03 fail→pass

## İlerleme günlüğü
- [x] P1: sync PASS (10/44, nextPrompt K2F-10, seq 27); K2F-10 in_progress; Dokun: quranLearn.js + test_kao2_grammar_tasks.js
- [x] Taban ölçüm (`tekrar-uret` R-03): 109 dersin yürüyüşünde 78 gramer görevi, 45 kusur
- [x] Kırmızı: test bölüm B (B1) yazıldı, 45 kusurla kırmızı görüldü
- [x] `kaoGrammarTaskValid` + `kaoGrammarItemPresentable` + `kaoLessonSafePlan`; kuyruk süzgeci; retry koruması
- [x] Test B2–B6; B6 mutasyonla (retry koruması kapatılınca kırmızı) doğrulandı
- [x] `kapilar.sh`: tüm kapılar YEŞİL; seq 28–30 ile durum/kapsam kayıtları eşitlendi
- [ ] Commit ve commit sonrası `fix-sync-check --clean --repro`

## Yapılan
- `app/core/quranLearn.js` (yalnız bu üretim dosyası)
  - `kaoGrammarTaskValid(task)`: `tekrar-uret` `grammarDefects` 5 kuralının üretim karşılığı (tek şık · "el +" yalnız g1 · Çekim
    tablosu dışında Arapça uyaran · Çekim tablosu yönergesindeki tırnaklı hücre = uyaran · örnekli şablonda uyaran, `byId(concept).examples`
    içindeki doğrulanmış örneğin Arapçası içinde) + tam bir doğru şık + boş/yinelenen şık etiketi yok. Gerçek şablon türüyle uyuşmayan,
    çözülemeyen kart ya da `exampleId` de geçersiz (fail-closed).
    Dışa `window.SeymaQuranLearn.kaoGrammarTaskValid` olarak açıldı (handler değil; App yüzeyi değişmez).
  - `kaoGrammarItemPresentable(item, d)`: öğeyi GERÇEKTE kurulacağı tohumla (öğe kimliği) kurar ve doğrular; gramer dışı öğe her zaman sunulabilir.
  - `kaoLessonSafePlan(plan, d)` (`kaoLessonStart`'ta plan kurulunca): sunulamayan gramer alıştırması AYNI dersin bir kelime alıştırmasıyla
    ikame edilir — öğe kimliği ve sırası korunur (devam noktası kararlı), `substitutedFor` izi tutulur, alıştırma sayısı düşmez; önce dersin
    kullanılmamış kart yönü (tr>ar, sonra ar>tr), yoksa tekrar.
  - `kaoBuildQueue`: sunulamayan gramer kartı adaylardan elenir (kapasite/gramer kotası harcamaz). Kart `data.quranLearn.cards`'ta kalır; yalnız sunumu kesilir.
  - `kaoAnswer`: yanlış cevapta eklenen "yeniden dene" öğesi `id+':retry'` ile farklı tohumla kurulur; sunulamayacaksa eklenmez.
- `tests/kao/test_kao2_grammar_tasks.js`: bölüm B (B1–B6) eklendi; bölüm A'ya dokunulmadı. Testler üretim doğrulayıcısını çağırmaz (bağımsız `defectsOf`).

## TDD
- Kırmızı: `node tests/kao/test_kao2_grammar_tasks.js` → B1: `AssertionError … actual: ['u01.01 g0_5-k1 tek şık', 'u01.01 g0_5-k2 tek şık', 'u01.01 g0_5-k2 uyaran örnek g0_5-e3 içinde değil', …]`
- Yeşil: `test_kao2_grammar_tasks (bölüm A+B): 14 kontrol PASS`
- Mutasyon: `kaoAnswer` retry koruması geçici kaldırıldı → B6 `geçersiz tohumlu tekrar eklenmemeli` kırmızı; geri alındı (dosya `diff` temiz, 14 PASS).

## Kapılar (P3)
P3 `kapilar.sh`: `SONUÇ: TÜM KAPILAR YEŞİL`.
`node --check` (5 modül) PASS · tests/kao (49) PASS · app (77) PASS · panel (23) PASS · panel-v2 (27) PASS · quran (9) PASS.
reminders · driver · zikr · contrast · plan-check · fix-sync-check --repro PASS.
KAO2 perf: PASS (content 183.287 KiB · runtime 99.058 KiB · css 12.938 KiB · p95 6.783 ms · steady 4.067 ms).
tekrar-uret: 5/10 PASS (önceki 4/10) — R-03 PASS; kalan R-04…R-08 FAIL (beklenen)

## Ölçümler
- Gösterilen gramer görevi (109 ders yürüyüşü): **önce 78 → şimdi 37**; kusur 45 → 0. 41 alıştırma 21 derste kelime alıştırmasıyla ikame edildi; en az alıştırma sayısı 9 (hedef ≥6); gösterilen alıştırma sayısı her derste plana eşit.
- Ders planında ikame edilen (41) şablon: g0_5-k1 g0_5-k2 g0_5-k3 g0_5-k4 g10-k1 g11-k2 g11-k3 g12-k2 g12-k3 g13-k1 g13-k2 g13-k3 g13-k4 g14-k1 g14-k3 g15-k1 g15-k2 g15-k3 g16-k2 g17-k2 g17-k3 g18-k1 g18-k3 g1-k3 g21-k4 g22-k3 g23-k2 g24-k1 g2-k1 g2-k2 g3-k1 g3-k2 g5-k1 g5-k2 g5-k3 g7-k2 g7-k3 g8-k1 g8-k3 g9-k2 g9-k3.
- Tekrar kuyruğu (86 şablon, 2026-09-30 tohumu): 36 sunulur, 50 elenir (tohuma bağlı: aynı şablon başka gün başka satırla geçerli olabilir).
  Atlananlar: g:g0_5:g0_5-k1, g:g0_5:g0_5-k2, g:g0_5:g0_5-k3, g:g0_5:g0_5-k4, g:g1:g1-k4, g:g2:g2-k1, g:g2:g2-k3, g:g3:g3-k1, g:g3:g3-k2, g:g4:g4-k3, g:g5:g5-k1, g:g5:g5-k2, g:g5:g5-k3, g:g5:g5-k4, g:g6:g6-k1, g:g6:g6-k3, g:g7:g7-k2, g:g7:g7-k3, g:g8:g8-k1, g:g8:g8-k3, g:g9:g9-k2, g:g9:g9-k3, g:g10:g10-k1, g:g10:g10-k2, g:g11:g11-k2, g:g11:g11-k3, g:g12:g12-k3, g:g13:g13-k1, g:g13:g13-k2, g:g13:g13-k3, g:g13:g13-k4, g:g14:g14-k1, g:g14:g14-k3, g:g15:g15-k1, g:g15:g15-k2, g:g15:g15-k3, g:g15:g15-k4, g:g16:g16-k2, g:g16:g16-k3, g:g17:g17-k2, g:g17:g17-k3, g:g17:g17-k4, g:g18:g18-k1, g:g18:g18-k2, g:g18:g18-k3, g:g19:g19-k4, g:g21:g21-k4, g:g22:g22-k3, g:g23:g23-k2, g:g24:g24-k2.
- Bütçe: içerik 183,287 KiB (tavan 256); runtime 99,058 KiB (tavan 128); css 12,938 KiB (tavan 14).
- Pinler değişmedi: App.kao* 42 · yüzey 763 · atama 601 · yayın 20261001b (yayınlanan `app/core/quranLearn.js` değişti → sonraki yayında pin yükselmeli).

## Bilerek değişen testler
- `tests/kao/test_kao_queue.js`: karma oturumda gösterilen 4 gramer türü → 3 güvenli tür; K2F-10 geçersiz Çekim tablosu
  görevlerini engeller (K4-02). K2F-11 görev kurucusunu düzelttiğinde dört tür beklentisi yeniden değerlendirilecek.

## Kanıt düzeyleri
- Kaynak/test: ✓ · Yayın: yok (canlıda eski davranış sürer; sonraki yayında pin yükselmeli) · Cihaz: yok (kullanıcıda)

## Sürprizler / sonraki promptlara not
- Görev satırı seçimi tohuma bağlı olduğundan geçerlilik de tohuma bağlıdır; bu yüzden doğrulama gerçek tohumla (öğe kimliği, retry için `id:retry`) yapılır.
- "Kelime dizme" ve "Parça çevir" şablonları (43 örnekli şablon) görev kurucuda "Kalıp eşle" dalına düşüyor ve uyaranı örnekten almıyor: ikamelerin çoğu bunlar. Asıl çözüm K2F-11 (görev kurucu örnekten ve kavramdan); sonra güvenlik ağı daha az ikame eder.
- `tests/kao/README.md` satırı (`test_kao2_grammar_tasks.js`) yalnız bölüm A'yı anıyor; README Dokun listesinde olmadığından değiştirilmedi — K2F-11'de güncellenebilir.
