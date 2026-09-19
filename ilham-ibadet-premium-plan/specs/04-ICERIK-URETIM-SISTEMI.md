# İçerik üretim sistemi

## Üç ayrı içerik katmanı

**Asıl kaynak:** referans kimliği, dil, yazar/kurum, alıntı sınırı ve kullanım hakkı. **Editoryal köprü:** kaynağa dayanarak yazılmış özgün kısa giriş; kaynak metni gibi sunulmaz. **Kişisel düşünme:** cevabı zorunlu olmayan soru; kullanıcının verdiği yanıt dinî hüküm veya psikolojik teşhis üretmez.

## Editoryal seri tasarımı

| Tema | Editoryal amaç | İçerik dengesi | Düşünme biçimi |
|---|---|---|---|
| Öğrenme | Merakı tek küçük soruya dönüştürmek | Öncü biyografisi + kaynaklı bağlam + öğrenme eylemi | “Hangi soru aklında kaldı?” |
| Merhamet | Kendine/başkasına özeni fark etmek | Kabul edilmiş dinî metin + özgün köprü | Yargısız gözlem |
| Şükür | Sıradan ayrıntıyı görmek | Kaynaklı seçki + kısa soru | Tek ayrıntı; zorunlu günlük değil |
| Sabır | Süreci anlamak | Öncü hikâyesi veya kabul edilmiş metin | Sonuç vaadi olmadan süreç |
| Emanet | Sorumluluğu somutlaştırmak | Kaynaklı açıklama + isteğe bağlı küçük eylem | Bugün uygulanabilir davranış |
| Umut | Yeni başlangıca yer açmak | Bağlamı korunmuş kısa okuma | Sağlık veya kesin sonuç vaadi yok |

Her seçki 2–5 dakika; uzun biyografi 5–10 dakika hedefli ayrı derinleşme. Tahmini süre okuma hızı varsayımıyla, Arapça/Türkçe metin türü dikkate alınarak verilir; gerçek tamamlanma ölçüsü değildir. Aynı kişiyi dinî tema için araçsallaştıran zorlama bağlantı kurulmaz. Tema bağlantısı yoksa sırf katalog dolsun diye eklenmez.

## Yayın hattı ve sorumlular

`draft → sourced → rights_checked → editorial_review → domain_review → approved → published`.

Biyografide domain_review tarih/iddia doğrulamasıdır; dinî içerikte yetkin dinî içerik incelemesidir. `rejected`, `needs_revision`, `withdrawn` yan durumları bulunur. İnsan inceleyen kişi/rol ve tarih bilinmiyorsa alan boş kalır, ajan tarafından doldurulmaz. Yazarı ve inceleyeni aynı kişi olan metinler ikinci inceleme bekler.

- **Editör:** dil, kaynaklı iddia, bağlam, kullanıcı değeri.
- **Alan inceleyicisi:** dinî metin/çeviri/atıf veya biyografik olgu.
- **Hak kontrolü:** kaynağın izin metni, kapsam, erişim tarihi; bu belge hukuki izin oluşturmaz.
- **Uygulayıcı:** renderer ve fixture; metni “daha güzel” diye sessiz değiştirmez.
- **Kullanıcı/ürün sahibi:** seçki tonu ve yayın kapsamı.

İnceleyen henüz atanmadıysa taslaklar plan klasöründe kalır. Mevcut kabul edilmiş katalogla IIP-02 prototipleri ve IIP-07/11 mevcut okuyucu çalışması sürdürülebilir. Yeni pilotu kullanan IIP-17, IIP-16 içerik kabulünü bekler; eski katalogla bu bağımlılık geçmiş sayılmaz. Yeni pilotun eksiltilmesi gerekiyorsa kapsam değişikliği kaydedilir; kart kendiliğinden tamamlandı olmaz.

## Kayıt örneği — yalnız sentetik editoryal taslak

```json
{
  "id": "editorial-attention-001",
  "version": 1,
  "kind": "editorial_prompt",
  "title": "Bugün bir fikre yer aç",
  "body": "Okumadan yanında götürmek istediğin tek bir düşünceyi seçebilirsin.",
  "sourceRefs": [],
  "rightsStatus": "original_draft",
  "reviewStatus": "draft",
  "reviewedBy": null,
  "religiousQuotation": false,
  "publishable": false
}
```

Kaynak listesi boş olan bu kayıt bir dinî metin değildir ve kaynaklı katalog pilotunu tamamlamaz. Dua kaydı için `sourceWork/sourceLocator/arabic/translationAttribution/rightsEvidence/reviewerDecision` zorunludur; sahte tamamlanmış örnek üretilmez. [İçerik inceleme şablonu](../templates/CONTENT-REVIEW.md) doldurulur.

## Kalite örneklemi ve düzeltme

Pilotun tamamı insan kaynak/hak incelemesinden geçer; büyük katalogda otomatik alan doğrulaması tüm kayıtlara, derin editoryal inceleme ise tüm yeni/değişen metinlere uygulanır. Salt rastgele örneklemi “tüm metin doğrulandı” diye raporlama yok. Arapça normalize edilmeden asıl metinle karşılaştırılır. URL'nin 200 dönmesi referansın doğru olduğunun kanıtı değildir.

Hata bulunursa içerik kimliğiyle issue, etkilenen sürüm, düzeltme, yeniden inceleme ve cache invalidation kaydı tutulur. Geri çekilen içerik eski yer iminde “Bu içerik güncellendi/kaldırıldı” açıklamasına gider; geçmiş ibadet/okuma kaydı otomatik silinmez.
