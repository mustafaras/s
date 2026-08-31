# Şeyma Premium FX Planı

**Proje:** Şeyma 🦩 uygulaması için premium görsel ve işitsel efekt yükseltme planı.
**Kapsam:** Sadece plan ve belgeler; uygulama kodu (`/Users/m_ras/Desktop/seyma`) bu klasörde değiştirilmeyecek.
**Durum:** Plan/spec/test aşaması tamamlandı; uygulama koduna henüz dokunulmadı. Kullanıcı onayı bekleniyor.
**Kural:** Uygulama aşamasında (`Faz -1`…`Faz 6`) tüm commitler sadece yerel kalır. Detaylar için [LOCAL-ONLY-IMPLEMENTATION.md](LOCAL-ONLY-IMPLEMENTATION.md).

## Bu Klasörü Okuyan Ajan İçin Context Yükü Sırası

1. **Her oturum başında oku:**
   - [`.anti-amnesia/CURRENT-STATE.md`](.anti-amnesia/CURRENT-STATE.md) — şu anki durum, engeller, son kararlar.
   - [`.anti-amnesia/LEDGER.md`](.anti-amnesia/LEDGER.md) — tarihsel kararlar (append-only, sadece oku).
   - [`NEXT-STEPS.md`](NEXT-STEPS.md) — bekleyen işler ve kısıtlamalar.
   - [`LOCAL-ONLY-IMPLEMENTATION.md`](LOCAL-ONLY-IMPLEMENTATION.md) — yerel-only commit kuralı.
2. **Sonra oku:**
   - [`PLAN.md`](PLAN.md) — vizyon, ilkeler, fazlar.
   - [`ROADMAP.md`](ROADMAP.md) — fazlı uygulama sırası.
3. **Oturum konusuna göre oku:**
   - Kod eşleme: [`CODE-MAP.md`](CODE-MAP.md)
   - Ses/haptik/animasyon kataloğu: [`FX-LIBRARY.md`](FX-LIBRARY.md)
   - Modül API yüzeyleri ve PR dizilimi: [`API-TRANSITION-GUIDE.md`](API-TRANSITION-GUIDE.md)
   - Atomik implementasyon adımları: [`DEEP-IMPLEMENTATION-GUIDE.md`](DEEP-IMPLEMENTATION-GUIDE.md)
   - Veri güvenliği ve erişilebilirlik: [`SAFEGUARDS.md`](SAFEGUARDS.md)
   - Faz spesifikasyonları: [`deliverables/SPEC-FAZ-0.md`](deliverables/SPEC-FAZ-0.md) … [`SPEC-FAZ-6.md`](deliverables/SPEC-FAZ-6.md)

## Hızlı Bağlantılar

- [Ana Plan: `PLAN.md`](PLAN.md)
- [Kod Eşleme: `CODE-MAP.md`](CODE-MAP.md)
- [Uygulama Sırası: `ROADMAP.md`](ROADMAP.md)
- [Ses & Efekt Kütüphanesi: `FX-LIBRARY.md`](FX-LIBRARY.md)
- [Erişilebilirlik & Güvenlik Kısıtları: `SAFEGUARDS.md`](SAFEGUARDS.md)
- [Yerel-Only Uygulama Kuralı: `LOCAL-ONLY-IMPLEMENTATION.md`](LOCAL-ONLY-IMPLEMENTATION.md)
- [Prompt Kataloğu: `.prompts/PROMPT-CATALOG.md`](.prompts/PROMPT-CATALOG.md)
- [Prompt Durumu: `.anti-amnesia/FX-PROMPT-STATE.json`](.anti-amnesia/FX-PROMPT-STATE.json)
- [Anti-amnesi Durum: `.anti-amnesia/CURRENT-STATE.md`](.anti-amnesia/CURRENT-STATE.md)
- [Değişim Kaydı: `.anti-amnesia/LEDGER.md`](.anti-amnesia/LEDGER.md)

## Amaç

Şeyma’nın mevcut sakin, glass-morphism tasarımını ve minimal ses katmanını bozmadan, uygulamaya **pro premium hisiyat** kazandıracak görsel ve işitsel efektlerin detaylı, uygulanabilir planını oluşturmak.
