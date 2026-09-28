# KAO-FIX · Arayüzde değişenler (FIX-01 … FIX-16)

**Güncel:** 2026-09-27 · canlı pin `20260926m` (`main` = `22ff310`) · Kapsam: "Kur'an Arapçası Öğreniyorum"
overlay'i (İlham & İbadet hub'ındaki KAO kartından açılır).

> Kanıt düzeyi: aşağıdakilerin hepsi **kaynak + headless fixture** ile doğrulandı ve Pages'e yayımlandı.
> **Cihazda doğrulanmadı** — son bölümdeki kontrol listesi bunun için.

Arayüze dokunmayan kartlar: FIX-01/02 (içerik araçları), FIX-09 (veri budanmıyor — davranış zaten böyleydi),
FIX-11 (yalnız testler; ek kısmı aşağıda), FIX-16 (plan belgeleri). Yeni düğme eklenmedi (App 756, onclick 393).

## 1. Oturum ve görevler

| Ne değişti | Önce | Şimdi | Kart |
|---|---|---|---|
| Kelime iki yönde soruluyor | Yalnız "Anlamı seç" (Arapça → Türkçe) | Ertesi günden itibaren aynı kelime "Arapçayı seç" (Türkçe → Arapça) olarak da gelir | FIX-06 |
| Tekrar eden çeldiriciler | Aynı yanlış şıklar art arda tekrarlarda dönebiliyordu | Bir önceki tekrarın yanlış şıkları (öteki yön dahil) sonraki tekrarda gelmez | FIX-08 |
| İşlev kelimeleri (edatlar vb.) | Kökü olmayan ~49 kelimede tek şık (yalnız doğru cevap) | Her soruda 4 şık; anlamca çakışan şık elenir | FIX-11 ek |
| Aynı türden görevler üst üste | Gramer 4'e kadar art arda gelebiliyordu | Hiçbir tür 2'den fazla art arda gelmez; yalnız gramer kalırsa oturum biraz kısa biter | FIX-15 |
| Anlamca yakın yeni kelimeler | Elle yazılmış 12 küme | Doğrulanmış sözlükten gelen komşular (70 kelime) yakın günlerde birlikte tanıtılmaz | FIX-14 |
| Hareke soldurma | "Harekeleri soldur" açıkken yeni olmayan her kartta | Yalnız iyice oturmuş kartta (tekrar aşaması, kararlılık ≥30 gün); öğrenme aşamasında harekeler tam kalır | FIX-15 |

## 2. Metin ve içerik

- **Kısa sûre ve Fâtiha anlamları** (parça görevleri, "7 gün sonra" testi, okuyucu, günün âyeti, namaz
  metinleri): 837 kelimenin Türkçesi yeniden yazıldı. quran.com'dan kopya ifadeler (618) ve İngilizce
  kalıntılar (26) kalmadı. Atıf: Tanzil + kendi Türkçe katmanımız. *(FIX-03, FIX-04)*
- **Kelime kartı başlıkları:** 26 başlıktaki bağlamdan gelen yanlış şedde kalktı, DİA okunuşundaki çift
  ünsüz düzeldi; kök ailesi listesindeki 286 girdi de aynı kuralla. `مَشَ` başlığı bir notla kaldı
  (korpusta tam biçimi yok). *(FIX-05)*
- **Arapça yazı tipi:** Görev, okuyucu ve kelime ekranlarındaki Arapça artık "Noto Naskh Arabic → Amiri →
  Scheherazade New" yığınıyla ve harf aralığı açılmadan çiziliyor (önce genel serif). Cihazda bu fontlar
  yüklü değilse sistem yedeği görünür. *(FIX-13)*
- **Yanlış cevap sınıfı:** Türkçede anlamı kaymış bir kelimede (kartta "dikkat · Türkçede var: …" uyarısı
  olanlar) yanlış cevap artık "kognat" hatası olarak sayılır; istatistiklerdeki hata dağılımı buna göre
  değişir. *(FIX-15)*

## 3. Ekranlar

- **Hub kartı ve ana ekran:** "N kelime kalıcı" sayacı artık yalnız **iki yönde de** oturmuş kelimeleri
  sayar (tekrar aşaması ∧ kararlılık ≥21 gün). Sayı eskisinden **düşük görünebilir** — veri kaybı yok,
  ölçü düzeldi (KF-7). Kapsam yüzdesi de aynı nedenle birkaç puan düşer. *(FIX-07)*
- **Kilometre taşları:** Önce 6 taştan 5'i hiç kazanılmıyordu. Şimdi cevaptan sonra koşul sağlanınca taş
  kaydedilir ve geri bildirim satırında "✦" ile duyurulur: "Fâtiha’yı anlıyorum", "Namazda ne dediğimi
  anlıyorum", "Kelimelerin yarısı tanıdık", "Üçte iki kapsam". "%80 kapsam" mevcut içerikle kazanılamaz
  (tavan %77,42) — karar bekliyor. *(FIX-10)*
- **Ayarlar:** En alta **"Kaynaklar ve lisanslar"** bölümü eklendi: Tanzil (CC BY 3.0), Quranic Arabic
  Corpus, Diyanet, Tadabur sesleri (CC BY-NC 4.0), AQQD (CC0 1.0), ts-fsrs (MIT). Bağlantılar yeni sekmede
  açılır. *(FIX-12)*

## 4. Cihazda kontrol listesi (K3 — yalnız kullanıcı verebilir)

- [ ] Bir oturumda aynı türden en çok 2 görev üst üste geliyor.
- [ ] Ertesi gün aynı kelime "Arapçayı seç" yönünde de soruluyor.
- [ ] Arapça metin Naskh görünümünde; Kur'an işaretleri doğru çiziliyor (iOS Safari).
- [ ] Hareke soldurma yalnız oturmuş kartlarda; dokununca harekeler geri geliyor.
- [ ] Ayarlar → "Kaynaklar ve lisanslar" görünüyor, bağlantılar açılıyor.
- [ ] Kilometre taşı kazanıldığında "✦" satırı görünüyor.
- [ ] Hub'daki "kelime kalıcı" sayısının düşmesi beklenen (iki yön kuralı).

Ayrıntı: [CURRENT-STATE](.anti-amnesia/CURRENT-STATE.md) · kart kanıtları [`kanit/`](kanit/) ·
denetim eşlemesi [KAO-KAPANIS-EK-1](../deliverables/KAO-KAPANIS-EK-1.md).
