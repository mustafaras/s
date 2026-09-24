# KAO-11 handoff

KAO-11 tamamlandı. E2 kelime oturumu iki yönde çalışır; cevap FSRS ile kaydolur ve yalnız `#kao-task` yenilenir. Üç saniyelik geri alma kartı ve günlük kaydı bit-bit geri sarar.

Ses aynı kökenli `assets/kao/audio/` klipleriyle ve `preload="none"` ile çalışır. Dokunma/Enter/Space ölçülü, 350 ms basılı tutma veya Shift+Enter akıcı kaydı çalar. İlk sunum otomatik sesi ayar ve sessiz saat kapılarıyla sınırlar; hata metin tabanlı oturumu durdurmaz.

Kayma içeren Türkçe aynı-köken rozeti renk yanında ikon ve “dikkat” metni taşır. Son tam kapı turunda ölçülen hedefli geçiş 0,704 ms’dir (sınır <50 ms). Kart kapıları ve tüm FX2 fixture'ları geçti.

Sonraki kart KAO-12’dir. KAO-11 yerel commit olarak kalır; bu kart için push/merge/tag/deploy ve kullanıcı-cihaz kabulü yapılmadı.
