# APP-REMINDER-UX — Release ve Veri Güvenliği Kapısı

Reminder programı dondurulmuştur; aktif prompt veya otomatik prompt teslim
politikası yoktur. Bu dosya gelecekte açıkça istenen bir release/live eylemi
için fail-closed sınırı korur.

## Varsayılan durum

- `releaseApproval.status`: `not_approved`
- `activePrompt`: `null`
- Kullanıcı cihazı kabulü: ajan tarafından yapılmadı
- `mustafaras/seyma-data`: yalnız ayrı ve açık veri yazma onayıyla

Bu repo temizliği push, deploy, tag, force-push, başka remote, Pages değişikliği,
dış sistem yazımı veya gerçek kullanıcı verisine erişim yetkisi vermez.

## Yeni iş veya release öncesi

1. Root güvenlik talimatları, güncel source ve test state'i okunur.
2. Yeni reminder kapsamı eski REM prompt zincirini canlandırmadan açıkça
   tanımlanır.
3. Kullanıcı eylemi ve kapsamı mevcut konuşmada açıkça belirtilir; belirsiz
   “devam”, “tamam” veya “test et” ifadeleri live onayı değildir.
4. Source/test, deploy ve kullanıcı cihazı kanıtları ayrı tutulur.

`not_approved` test, local commit veya tarihsel evidence ile değiştirilemez.
Browser ile doğrulama yapılmaz; uygulama headless VM ve sentetik fixture'larla
kontrol edilir.
