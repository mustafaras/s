> Yöntem düzeltmesi: Bu genel çekimler sırasında onboarding denetimi, boş sentetik profilde parola alanının DOM’da var olup olmadığını sorguladı; parola değeri okunmadı veya doldurulmadı, gerçek profil kullanılmadı. Alanın kendisine otomasyonla erişmeme sınırı bakımından bu sorgu sorunludur; genel çekim aracından kaldırıldı. Ham sonuçlar korunur ve bu yöntem G4 uyumlu diye sunulmaz.

# 2026-10-28 · v5b · 320 piksel klavye ve ekran koordinatı örneği

Açık ve koyu iki koşumda 76'şar sahne, 44'er CTA; `--dogrula --v5-guncel` exit 0, 152/152. Her CTA için ikinci render viewport y ve scroll değerleri ve ikinci renderdan sonra Shift+Tab ile hedeften ayrılma, Tab ile hedefe dönüş ve odağın görünür kalması kaydedildi. Önce hedef programatik odaklanır; deneme, dialog başından tüm gezinme sırasını kanıtlamaz. İlk renderda ayrıca Tab denenmedi; build ve cloze genel matrisin içinde bu sürümde yoktur. Bu yüzden 21'in bütün görev/viewport kabulü ve cihaz/ekran okuyucu kabulü değildir.
