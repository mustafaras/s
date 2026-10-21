# K3PD — Bağımsız denetleyici ve kabul sözleşmesi

Tarih: 2026-10-21 · Sürüm: 1 · Durum: ACTIVE POLICY · Canlı kart sayımı DURUM.json’dan okunur.

Eş belge: [PROMPTLAR.md](PROMPTLAR.md). Bu dosya planın denetleyicisidir; bir test betiği veya çalıştırılmış kabul raporu değildir. Eski K3P programının 37/37 kaydı korunur. Ardıl plan 34 karttır; “37 kartın düzeltmesi” ile “34 yeni prompt” aynı sayım değildir.

## 1. Yetki, rol ve hüküm

### 1.1 Bugün ne yetkilendirildi?

Kullanıcı, önceki bağımsız denetimi kapsamlı, sıralı ve odaklı promptlara dönüştürüp iki Markdown dosyası kaydetmeyi istemişti. Bu tarihsel istek yeni kod/yayın yetkisi değildi. Kartlar yalnız canlı state ve o oturumdaki kullanıcı talimatıyla seçilir. Eski K3P-27 yayın onayı bu plana taşınmaz.

**Bir defalık K3PD-14 yetkisi (2026-10-21):** Kullanıcı bu oturumda “canlıya al o zaman” dedi ve prompt kapısını düzeltmemizi istedi. Bu açık talimat, yalnız K3PD-14’ün exact adayını DENETLEYICI G6’daki varsayılan K3PD-32/33 sırası ve bağımsız denetçi raporu beklenmeden canlıya alma yetkisidir; K3PD-14 kartındaki istisna ortak PROMPTLAR §1.5/§3.3 şartlarına da yalnız bu aday için açık istisnadır. Bu, bağımsız denetim PASS’i değildir; kullanıcı tarafından kabul edilmiş sapma `ACCEPTED_DEVIATION` olarak kaydedilir. Aday SHA, exact kapsam ve gerçek yanıt KAYIT.md’de aday commit’inden sonra bağlanır. Bu istisna K3PD-15’i, başka kartı veya gelecekteki yayınları yetkilendirmez.

### 1.2 Denetleyici ne yapar?

Kuşkucu, bağımsız kabul denetçisisin. Uygulayıcının komut özetine, PASS sayısına, ledger’a, state’e veya commit mesajına güvenerek kabul verme. Her iddiayı normatif gereklilik → onaylı karar → gerçek diff → kaynak → davranış testi → güncel HEAD → gerekli görsel/uzak kanıt zincirinde kontrol et.

Varsayılan salt okunursun: kod, test, state, ledger, pin ve tarihsel artefaktları değiştirme; düzeltme/stage/commit/push/merge/tag/deploy yapma. Kaynağı incelenmiş, ağsız, sentetik testleri çalıştırabilirsin. Geçici dosya gerektiren freeze/G3 veya yeni görsel/G4 ancak ilgili seçili kartın açık sınırı içinde, izole geçici alanda ve cleanup kanıtıyla yapılır; “salt okunur denetim” diyerek yazma yapan komutu sessiz çalıştırma. Gerçek kişisel veri/token/hesap/seyma-data bu planın denetiminde kullanılmaz.

Denetleyici sonuçları uygulayıcıya raporlar; state kapanışını uygulayıcı kanıtı ve kontrolüyle yapar. Yeni kod değişikliği kabul edilmiş diff’i değiştirirse tekrar denetlenir. İkinci ajan kullanılırsa uygulama verisini etkileyen değişiklikte tek yazar kuralı korunur; denetleyici read-only kalır.

### 1.3 İzin verilen verdictler

| Verdict | Kesin anlam |
| --- | --- |
| PASS | İlgili alt kabul doğrudan, güncel ve kapsamı yeterli kanıtla sağlandı. |
| PARTIAL | Bir alt kabul uygulanmış, en az biri eksik/hedef dışında. |
| FAIL | Gereklilik yanlış uygulanmış veya gerilemiş; yeniden üretim mevcut. |
| UNVERIFIABLE | Gerekli kanıt/araç/girdi yok; doğru olduğu çıkarılamıyor. |
| ACCEPTED_DEVIATION | Kullanıcı, tam bu hedef/kohort/alan için somut sapmayı açıkça kabul etmiş. Özgün hedefin PASS’i değildir. |
| EVIDENCE_PENDING | Kaynak hazır; planın açık geç-kanıt bağımlılığı henüz tamamlanmamış. |
| NOT_MEASURED | Ölçü veya özgün bilimsel hipotez eldeki veriden ölçülemiyor. |
| BLOCKED / AWAITING_OWNER_DECISION | Teknik engel veya gerekli gerçek kullanıcı kararı bekleniyor. |

Nihai hüküm: TAM_UYUMLU, KABUL_EDILMIS_SAPMALARLA_TAMAM, EKSIK_KUSURLU veya KANIT_YETERSIZ. Tek bir alt kapı PASS’i taşınan bulguyu silmez. Bağımsız denetimde bulunan kusuru uygulayıcıya geri yönlendir; denetim oturumunda düzeltme yapma.

## 2. Tarihsel denetim tabanı ve korunacak işler

Taban repo `/Users/m_ras/Desktop/seyma`; main HEAD ve yerel origin/main: `d030610f7613fc2c4aaafc36297a34b0ffb9c3ec`. Eski state: completed / nextPrompt=null / APPROVED-2026-10-18 /37 kart /pinDeferral=[]. Release commit 6c10693c, pin 20261018a; Pages run 39126116607 ve 64/64 parity **tarihsel kayıt**. Uzak sonuç bu denetimde ağdan yeniden doğrulanmadı. Başlangıç bilgisi yeniden okunduğunda değişmişse eski sayıdan güncel karar üretme.

Korunacak mevcut dirty dosyalar, bu plan yazılmadan hemen önce:

| Yol (repo köküne göre) | Durum | SHA-256 |
| --- | --- | --- |
| kao3-premium/KAPANIS.md | değiştirilmiş | d8e8419e2849b9eec922e537bca7100149fdfee6120ce850fda77128f8af9bcd |
| kao3-premium/README.md | değiştirilmiş | 1aee47cdd05726f4a5966748ae3f786bd79d2e394dd37f3ec7b083f2d36eed0f |
| kao3-premium/kanit/sonraki/GORSEL-KANIT.md | izlenmeyen | d7627027bba21007550f0a5c76130a4d9f11b7b896d001a60e9333c81ffeed28 |

Bu hashler içerik sahipliği için koruma tabanıdır; kullanıcı sonradan değiştirirse eskiye döndürme. Yeni hash/diff’i okuyup yeni dış kapsam olarak kaydet. Doğrudan main’de üretim değişikliği veya unrelated kirli işi stage etme.

Denetimde çalıştırılan 51 test dosyası geçti; bu,82 KAO+diğer tüm ailelerin yeniden çalıştırıldığı anlamına gelmez.27 K3P +21 diğer KAO +3 app fixture, ayrıca güvenli driver ve ölçü araçları kullanıldı. Bağımsız negatif sınamalar kusurları yeşil fixture’lara rağmen üretti. Bu tarihsel sonuç, yeni düzeltmenin test makbuzu değildir.

### 2.1 Başlangıç bulgu sicili

Satırlar tarihsel audit gözlemidir. İşlev adını güncel kaynakta rg ile bul; satırları değişmez API gibi kullanma.

| Bulgu | Başlangıç kanıtı / etki | Öncelik | K3PD kapanış kartları |
| --- | --- | --- | --- |
| F-01 | [quranLearn.js:2502](../../app/core/quranLearn.js#L2502): H4 uygunluğu scheduled.s ile hesaplanıyor; s=21/40 yanlışlarında n artmıyor. Okunuşun açılması izlenmiyor. | P1 | 02, 03, 26, 31 |
| F-02 | [Flow:201](../../app/core/quranLearnFlow.js#L201) ve [442](../../app/core/quranLearnFlow.js#L442): medyan yerine ortalama; tahmin cap ile bastırılıyor. 13 görev × 30 sn → 7 dk, gösterim 5 dk. | P1 | 04, 05, 06, 28, 31 |
| F-03 | [quranLearn.js:1781](../../app/core/quranLearn.js#L1781): en az 8 sonuç koşulu yok; Latin okunuş görünür; yeniden tanışmada örnek yok. Kaynak regex testi davranışı kanıtlamıyor. | P1 | 07, 08, 09, 31 |
| F-04 | [380](../../app/core/quranLearn.js#L380) ve [1903](../../app/core/quranLearn.js#L1903): build hedef ipucu yok; seçilen harfler birleşmiyor; harf adı kabulü zayıf. | P1 | 10, 11, 29, 31 |
| F-05 | [426](../../app/core/quranLearn.js#L426): genel fill yedeği her POS türüne açılıyor. 129 cloze taramasında 28 farklı POS çeldirici bulundu. | P1 | 12, 24, 25, 31 |
| F-06 | [3061](../../app/core/quranLearn.js#L3061): ses kapalı/sessiz saatte 1 ses başladı; hiç ended gelmeden 9/9 kelime yaldızlandı. | P1 | 14, 15, 31 |
| F-07 | [3512](../../app/core/quranLearn.js#L3512): ikinci klipte render sayısı 1→1 kaldı; tekli çalmada seçili indeks 3 iken playing=0 oldu. | P2 | 16, 29, 31 |
| F-08 | [1929](../../app/core/quranLearn.js#L1929): yavaş doğru şeridine dokunma duraklatmak yerine ilerletiyor. | P2 | 13, 23, 31 |
| F-09 | [Views:335](../../app/core/quranLearnViews.js#L335): görünür öğretim örneği yok; goal en çok 62/25 sözcük, 80/109 ekran >45; giriş 3/2, tam ders 42/40 dokunuş. | P2 | 19, 20, 21, 22, 23, 24, 25, 28, 29, 31 |
| F-10 | [1863](../../app/core/quranLearn.js#L1863): pointercancel bir cevap üretiyor. | P2 | 17, 31 |
| F-11 | [shoot-modal:48](../../tools/kapi/gorsel-qa/shoot-modal.mjs#L48): açık tema sabit değil; onboarding teması seçilmiyor. 6 log × 74 = 444 ayrıntılı kayıt; 474 kaydın aynı kapsamda olduğu iddiası yanlış. | P2 | 21, 29, 30, 31 |
| F-12 | [deney-rapor:114](../araclar/deney-rapor.cjs#L114): H7 bütün günlerde 20/26 ile yeşil, kesim sonrası 7/13. H5/H9 özgün hipotez yerine vekil ölçü. | P2 | 02, 26, 30, 31 |
| F-13 | [2504](../../app/core/quranLearn.js#L2504): kalıcı calib.s21 eklenmiş; “şema değişmedi” kaydı yanlış. [3015](../../app/core/quranLearn.js#L3015): model ensure çağrısıyla girdiyi değiştiriyor. | P2/P3 | 02, 03, 18, 30, 31 |
| F-14 | Runtime L6=136651 B / 133,448 KiB; L9=136254 B / 133,061 KiB. CSS 16258 B / kalan 126 B. Başlık 36, gerçek kart sayısı 37; targets.runtimeKiBMax=128 bayat. | P3 | 00, 28, 30, 31 |

P0 tespit edilmedi; bu, kapsam dışı tüm güvenlik durumlarının kanıtlandığı anlamına gelmez.

### 2.2 Tarihsel ölçüm ve onay sınıfları

| Konu | Geçerli yorum |
| --- | --- |
| Runtime 128→136 KiB | K3P-18 kullanıcı kararı kayıtlı;136 bağlayıcı. L6 veL9 ayrı. |
| CSS14→16 KiB | K3P-09 kullanıcı kararı kayıtlı; başka artış bu planla onaylanmaz. |
| Toplam tanıma/MC92.92%yeni,91.57%yerleşik | Genel≤60 hedefi karşılanmamış; karışık örnekte R1=48.94% ayrı yöntem. Önceki karışık örnek onayı genel hedef feragati değildir. |
| 42/40,62/25,3/2 | Kapanışta yazılmış olmaları açık feragat değildir. Yeni hedef kararı yoksa FAIL/NOT_MET. |
| H5/H9proxy | Belgelenmiş yaklaşık ölçü; özgün hipotez için doğrudan kanıt değildir. |
| Eski tekrar-uret9/10 | Tarihsel R08 apply.words/sentences model farkı; güncel 109 render kanıtı ayrıca aranır.10/10 diye etiketlenmez. |
| Şema k3pNoticeAt | K3P-25 için alan bazlı kullanıcı kararı kayıtlı; H4 s21 için aynı yetki varsayılmaz. |
| Eski ara yayınlar | Ayrı onay kayıtları var; geçmiş kurallardaki “yalnız 27” satırıyla otomatik ihlal sayılmaz. Yeni programa yayın yetkisi vermez. |

## 3. Ardıl kontrol düzlemi — K3PD-00’da kurulacak

Bugün yalnız iki Markdown dosyası vardır. Aşağıdaki JSON/araç dosyalarının var olduğu iddia edilmiyor.00 açıkça verildiğinde, onun allowlist’iyle oluşturulur.

### 3.1 Dosyalar ve sahiplik

| Yol | Amaç | Yazarı |
| --- | --- | --- |
| DURUM.json | Tek makine otoritesi: sıra, kart durumu, kararlar, kanıtbağımlılıkları, pin borcu | Seçili kart uygulayıcısı |
| GUNCEL-DURUM.md | İnsan özeti ve yarımkart devirnotu | Seçili kart uygulayıcısı |
| KAYIT.md | Append-only karar/kart/denetim/yayın kayıtları | Seçili kart uygulayıcısı |
| araclar/durum.mjs | Saltokurstate/prompt/kayıtuyumu; --check/--sonraki/--liste/--prompt ID | 00 |
| araclar/kapi.mjs | Kart ve final doğrulama; --kart ID/--yavas/--final | 28 |
| araclar/pin-yukselt.mjs | Ardıl branch’e özel koordineli dry-run/pin | 32 |
| kanit/K3PD-NN/ | Komut/env/exit/ölçü/başlangıç hash/diff ve gerekiyorsa sentetik artefakt | Sadece o kart |

Eski K3P state/current/ledger ve kanıtlar ayrı kalır. Eski senkron yeni ID’leri bilmez; onu değiştirip kapanmış programı yeniden başlatma.

### 3.2 Asgari DURUM sözleşmesi

00 gerçek anahtarları bu sözleşmeyle kurar; eksik alanları any veya serbest biçimli string ile yutma.

- `program: K3PD`, `planVersion:1`, `branch:k3pd-denetim-duzeltmeleri`, `baselineHead`:00’da doğrulanan SHA.
- `status`: planned / active / awaiting_owner_decision / local_verified / release_candidate / awaiting_release_approval / released / blocked. released yalnız 33’ün tam kanıtında; local_verified yalnız 31’in kaynak/görsel kabulünde.
- `executionOrder`: tam 34 ID, K3PD-00…K3PD-33, boşluksuz/sıralı/tekil.
- `nextPrompt`: sıralı listedeki ilk yapılacak karttır; 00 başlangıcında K3PD-00 olur. done kartları atlanır. Yalnız 11/21 için izinli source_ready kartı geçici olarak atlanır ve 12/22 açılır; 29 bu iki kartın kabulünü tamamlar. Bu atlama done sayımı değildir. blocked veya awaiting_owner_decision kartı atlanmaz. Bütün kartlar done ve yayın kapsamı tamamlanmışsa null olur.
- `cards`: her ID için status(todo/in_progress/ready_for_audit/source_ready/done/awaiting_owner_decision/blocked), baseHead, changedPaths, checks, auditVerdict, evidenceRefs, acceptanceDependencies. Öğelerinin türleri ve zorunlu alanları kontrol testinde sabittir.
- `decisions`: `h4`, `timeBudget`, `recognition`, gerekirse `goalException` ve yeni şema kararları. Her biri pending/proposed/approved/rejected; tam konu, öneri, seçenekler, gerçek yanıt, tarih, kaynak referansı, kapsam. Bir ledger iddiasını “gerçek yanıt bulundu” diye otomatik kabul etme.
- `releaseApproval`: başlangıç NOT_APPROVED; aday SHA, exact scope ve gerçek yanıt/tarih olmadan APPROVED olamaz.00’daki genel çalışma isteği 33 yayınonayı değildir.
- `pinDeferral`: branch tam ardıl dal; until=K3PD-32; files yalnız exact paths. wildcard/parent/directory/kapsam dışı yol yasak. main’de istisna 0.
- `externalGates`: device, screenReader, L2, audio230, study14, study30, remoteParity; her birinde status/evidenceLevel/owner/agentVerified. Olmayan sonuç unknown/pending; user_attested ile agent_verified ayrı.

source_ready yalnız 11 ve 21 için kullanılabilir. Kod, negatif test ve bağımsız kaynak denetimi tamamlandığında bu kartların tek uygulama commit’i source_ready ile kapanabilir. 12 ve 22 bu açık geç kanıt bağımlılığı altında başlayabilir. 29 görsel kanıtı tamamladığında, aynı kartın kayıt güncellemesiyle 11/21 durumları done olur; yeni uygulama yapılmaz. 31 öncesi ikisi de done olmalıdır. Bu istisna başka kartlara genellenemez.

Önkoşul grafiği: sıralı 00→33;02 approved→03,04 approved→05→06,14→15→16,19→20→21(source_ready)→22→23,24 approved→25;11+21 geç kanıt→29;27+28+29+30→31;31→32;32+exact aday yayın onayı→33.

### 3.3 Kayıt ve durum uyumu

Her kayıt artan seq, ID, tür, tarih, taban SHA, kapsam, gerçek komut/env/exit, ölçü/payda, denetim hükmü, açık kabuller ve sonraki adayı içerir. Commit hash’i kendi commit’ine yazılmak zorunda değildir; git log ile sonradan çözülür. Makbuz kabuğun değil gerçek child sürecinin exit kodunu içerir. Sentetik örnek çıktısı açıkça etiketlenir.

Durum aracının negatif testleri: eksik/yinelenen/sırasız ID, işaret eşleşmemesi, yanlış nextPrompt, denetimsiz done, kararı olmayan bağımlı, eksik kanıt, yetkisiz source_ready, main pin istisnası, bilinmeyen yol ve kapanmış program borcu. Sonraki öneriyi basmak sonraki işe yetki vermek değildir.

## 4. Doğrulama grupları — tam komutlar ve yan etki sınırı

Bütün yollar repo köküne göredir. Önce test kaynağını, importlarını ve env/child process/FS/ağ yan etkilerini incele. Kısaltmalar PROMPTLAR §4’tedir; burada tam komutlar bulunur. Geniş test grubu seçili kartın yazma kapsamını genişletmez. Kod değişmediyse aynı geniş testi gereksiz tekrarlama; yeni değişikliğin etkilediği kapıları yenile.

### G0 — Her kartın kapsama ve temel güvenlik kontrolü

```bash
git status --short --branch
git rev-parse HEAD
git diff --check
node --check app.js
node --check sync.js
node --check app/core/quranLearn.js
node --check app/core/quranLearnFlow.js
node --check app/core/quranLearnViews.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
```

00 öncesi yeni araç çalıştırılmaz.00 sonrası:

```bash
node kao3-premium/duzeltme-plani/araclar/durum.mjs --check
node kao3-premium/duzeltme-plani/araclar/durum.mjs --sonraki
node tests/kao/test_k3pd_control.js
```

`driver --dump` kullanılmaz; defaultdriverin dumpolmadığında dosya yazmadığını canlıkaynakta doğrula. DeğişenherJSiçin ayrıca node--check; dosya sözdizimi başarıyı UIkanıtı sayma. Belgekartlarında aynıHEAD’de mevcutgeçerlitemelmakbuz yenidenreferanslanabilir; kapsam/hash/durumkontrolü herseferinde yenilenir.

### G1 — Ortak KAO regresyonları

```bash
node tests/kao/test_kao_migration.js
node tests/kao/test_kao2_migration.js
node tests/kao/test_kao_fsrs.js
node tests/kao/test_kao_queue.js
node tests/kao/test_kao_requirements.js
node tests/kao/test_kao_render.js
node tests/kao/test_kao2_navigation.js
node tests/kao/test_kao2_a11y.js
node tests/kao/test_kao2_inventory.js
node tests/kao/test_kao2_design_contract.js
node tests/kao/test_kao_pronunciation_contract.js
node tests/kao/test_kao_phonics_contract.js
node tests/kao/test_k3p_mount.js
node tests/kao/test_k3p_focus_lock.js
node tests/app/test_asset_pin_freshness.js
node tests/app/test_iip_22.js
node tests/kao/test_kao2_perf_budget.js
node tools/kao/kao-plan-check.mjs
node tools/kao/kao-verify-contrast.mjs
```

Perf çalıştırmadan önce `KAO2_WRITE_BASELINE` ortam değişkeninin yazmayı açmadığını doğrula; taban yazma. Mümkünse göreli bandı atlamadan çalıştır. Gerekirse yalnız `KAO2_ACCEPT_SLOW_HOST=1` istisnasını kaydet; p95≤40 ms ve bütün mutlak boyut tavanları zorunlu kalır. L6 ve L9 değerlerini her dosyaya aynı sıkıştırma yöntemiyle uygulayıp ayrı hesapla; dosyaları birleştirerek toplamı küçültme. Tarihsel L6=136651 B, L9=136254 B ve CSS=16258 B değerlerini yeni ölçüm gibi taşıma. Sayısal kontrast testi, computed renk veya gerçek görsel kabulü yerine geçmez.

### G2 — Ders planı, kurucu ve büyük matris

```bash
node tests/kao/test_kao2_lesson_flow.js
node tests/kao/test_kao2_lesson_coherence.js
node tests/kao/test_kao2_mastery.js
node tests/kao/test_kao2_grammar_tasks.js
node tests/kao/test_kao2_denetim.js
node tests/kao/test_kao2_kabul.js
node tests/kao/test_k3p_rhythm.js
node tests/kao/test_k3p_distractors.js
node tests/kao/test_k3p_ladder.js
node tests/kao/test_k3p_build.js
node tests/kao/test_k3p_cloze.js
node tests/kao/test_k3p_budget.js
node tests/kao/test_k3p_resume.js
node tests/kao/test_k3p_lesson_ayah.js
```

Yavaş testler seçili kartın kapsamı veya final kontrolü gerektiriyorsa zorunludur. `test_kao2_kabul` için kanıt yazan ortam değişkeni açıksa çalıştırmadan kaldır veya izole et; hangi değişkenin yazmayı açtığını canlı kaynakta doğrula. Çeldirici testinde eski taban dosyası yok diye sıra karşılaştırması atlanırsa tarihsel karşılaştırmayı ayrıca bellekte yap veya o alt kanıtı UNVERIFIABLE yaz.

### G3 — İçerik/font yeniden üretimi, yalnız izinli izole alan

```bash
node tests/kao/test_kao_freeze_repro.js
node tests/kao/test_kao_pronunciation_contract.js
node tests/kao/test_kao_phonics_contract.js
node tools/kao/kao-font-subset.mjs
```

Freeze testi üç yerel girdi arar: `kaynak/kuran/icerik/inputs/quranic-corpus-morphology-0.4.txt`, `kaynak/kuran/icerik/inputs/quran-uthmani.txt`, `kaynak/kuran/icerik/lexicon.reference.json`. Eksik girdi SKIP ve exit 0 üretebilir; bu gerçek üretim PASS’i değildir. Çalıştırma yalnız 27 veya izinli final yeniden kontrolü kapsamında olmalıdır. Araçlar geçici kopyada üretir; dört üretim modülünün önce/sonra SHA eşliği, geçici yol sahipliği ve cleanup doğrulanır. Font komutu `--build` olmadan çalışır; mevcut cmap salt okunur incelenir. Girdiyi arşivde aramak gerekiyorsa gerçek konumu ve erişim yetkisini doğrula; tahmini yol, indirme veya kişisel veri kaynağı kullanma.

### G4 — Kontrollü sentetik görsel kabul, yalnız 29

```bash
node tests/app/test_local_visual_qa_guard.js
```

Çekim komutunu canlı `tools/kapi/gorsel-qa/README.md`, shoot-modal ve cdp arayüzünden çöz; varsayımsal flag’i gerçek komut gibi yazma. Ortam yalnız `127.0.0.1:9000` ve geçici ajan profilidir. forceSync yok; token alanları okunmaz veya doldurulmaz; dış ağ engellenir. Guard 1, token yokluğundan bağımsız esas güvenlik sınırıdır.

Her sahnede gerçek root data-theme ve computed renk, yüklenmiş font, viewport/yükseklik/safe-area, sahne ID ve önkoşulu, CTA geometrisi/örtüşme/görünürlük, sayfa–diyalog–bileşen taşması ayrı kaydedilir. Görüntü, log ve manifest birbirine hash ile bağlanır; onboarding de bu kapsamdadır. Ham görüntüleri veya okunabilir eşdeğerlerini koru. Yerel çizimle taklit edilen glif, gerçek browser font yükleme kanıtı değildir. Her açık profil false, her koyu profil true ile sabitlenir; ardından computed doğrulama yapılır. Görüntü etiketi tema kanıtı değildir.

Sunucu başlatılırsa yalnız o PID’yi kontrollü kapat; başkasının sunucusunu pkill ile öldürme. Mevcut bir yerel yüzey kullanılıyorsa origin güvenliğini doğrula. Headless QA fiziksel cihaz kabulü değildir.

### G5 — Ölçüler, bütün fixture aileleri ve final

```bash
node kao3-premium/araclar/cift-sik.cjs
node kao3-premium/araclar/akis-olc.cjs
node kao3-premium/araclar/dokunus-olc.cjs
node kao3-premium/araclar/okunus-denetim.cjs
node kao3-premium/araclar/deney-rapor.cjs --ornek
node tools/kapi/tekrar-uret.cjs
```

Her komutun gerçek exit kodunu ayrı yakala; `node ... | tail` sonucunu child exit’i sayma. Tarihsel tekrar-uret sonucu exit 1 ve 9/10’dur; eski R-08 model farkı, güncel ders render kontrolüyle birlikte değerlendirilir. Güncel denetim de kırmızıysa tarihsel istisna kullanma.

28’de araç yazıldıktan sonra aşağıdaki komutlar gerçek arayüzle kullanılabilir. İlk komut 28’i doğrular. İkinci komut 29/30 tamamlanmadan eksik kanıt nedeniyle kırmızı dönmelidir; bu beklenen bir negatif sınamadır. Olumlu final kabulü 31’dedir.

```bash
node kao3-premium/duzeltme-plani/araclar/kapi.mjs --kart K3PD-28 --yavas
node kao3-premium/duzeltme-plani/araclar/kapi.mjs --final --yavas
```

Final, kaynak ve ortam güvenliği incelenmiş bütün `tests/kao/test_*.js`, `tests/app/test_*.js`, `tests/panel/test_*.js`, `tests/panel-v2/test_panel_v2_*.js`, `tests/quran/test_*.js` ailelerini, `node tests/reminders/run-reminder-smoke.mjs` ve G0 harness’lerini kapsar. Dosya sayıları koşu anındaki gerçek listeyle eşleştirilir; tarihsel 82/78/27 sayılarına sabitlenmez. Panel-v2 ve panel ayrı kanıttır; app driver bunların render kabulü yerine geçmez. PASS sayısı; SKIP, yarım koşu, eksik dosya veya timeout’u gizleyemez.

Eski kapi-hizli/kapilar scriptleri geçici log yazar ve bitmiş K3P state’ini tüketir. Bunlar yeni ardıl programın otoritesi değildir. Çalıştırılırsa gerçek kapsam ve yan etkileri raporlanır; yeni final gate yerine kullanılamaz.

### G6 — Varsayılan 33; K3PD-14 için kaydedilmiş bir defalık kullanıcı istisnası

Varsayılan kural K3PD-33 ve exact aday bazlı açık onaydır. Yalnız 2026-10-21 K3PD-14 oturumu için yukarıdaki kullanıcı istisnası K3PD-32/33 ve bağımsız denetim önkoşulunu kaldırır. Git remote kimliği ve aday SHA’yı doğrula; kişisel depo URL’si veya token basma. Bu istisna kapsamındaki push yalnız K3PD-14 exact allowlist değişikliklerini ve mevcut dalın zaten commit edilmiş atalarını içerir; korunan/önceden kirli yolları stage etme. Yerel commit, main/origin SHA paritesi, doğru head SHA’ya ait validate/deploy workflow ve bütün public host/varlık URL’lerinin canlı SHA eşliği ayrı kanıtlardır. Push yalnız bu kayıtlı kullanıcı talimatıyla yetkilidir; merge/tag kapsamda değildir. Yayın öncesi üretim veya pinli aday değişirse aday ve kanıt yenilenir. Geçmiş workflow sonucu yeni SHA’ya kanıt yapılamaz. Teknik başarısızlıkta yayın yapma ve ilgili gate’i açık bırak.

Manifest URL listesini index/sw/panel ve onaylı offline allowlist’ten çıkar; 61/64 sayılarını hardcode etme. Cache-Control:no-cache, Pragma:no-cache, no-store ve benzersiz query ile public GET yap. HTTP 200 tek başına hash paritesi değildir. Uygulama gerçek hesap tarayıcısında açılmaz. Ağ/araç/credential engelinde kullanıcıdan chat üzerinden sır istenmez; ilgili uzak alan UNVERIFIABLE kalır.

### G4/G5 geç kanıtı ve yayın SHA sözleşmesi

28’de G4 çalıştırılmaz. Bu kartta yeni kapının kendi kontrolleri ve negatif self-testleri doğrulanır; eksik 29/30 kanıtıyla --final komutunun nonzero dönmesi beklenen başarılı negatif sınamadır. Gerçek görsel çekim 29’dadır. 30 ve 31, G4 için 29’un mevcut manifest/hash/tema/geometri kanıtını salt okunur denetler; yeni browser veya screenshot başlatmaz. Kanıt güncel üretimle eşleşmiyorsa 29 yeniden açılır; 31’de gizli yeni çekim yapılmaz.

32 sonunda onaya sunulan üretim/pin adayı SHA’sı A’dır. 33 yalnız A’yı main/origin’e taşır ve A’ya ait workflow/canlı parity’yi doğrular. Sonraki yayın makbuzu ve state değişiklikleri R adlı ayrı, yalnız yerel ardıl dal metadata commit’inde kalır. R, A’nın yayın onayını değiştirmez çünkü R yayımlanmaz; üretim baytlarının A↔R eşliği ayrıca doğrulanır. Yerel HEAD R iken origin/main A ise Git SHA paritesi yoktur; yayımlanan adayın paritesi ile yerel kayıt farkı ayrı raporlanır. R’nin de uzak depoya taşınması bu planın varsayılan yayın onayına dahil değildir. Yayın öncesi üretim/pin adayının değişmesi ise A/onay/kapı bağını yenilemeyi gerektirir.

## 5. Denetleyicinin zorunlu negatif sınama matrisi

Aşağıdaki senaryolar uygulanmış kabul edilmez; ilgili kartın son HEAD’inde gerçekten yürütülür. Gerekiyorsa mevcutfixture’a eklenir; yeniindependentassert üretimhesabınıkopyalamamalıdır.

| Kart(lar) | Mutlaka kırmızı yakalanacak eski davranış | Pozitif ve sınır kanıtı |
| --- | --- | --- |
| 00/01 | Eksik ID, yanlış sıra/state, main deferral veya wildcard ile kabul. | 34 ID/işaret eşliği; exact branch/path; eski K3P korunur. |
| 02/03 | s=21/40 yanlışının n=0 kalması; cevap sonrası s ile uygunluk. | s=20/21/40 × doğru/yanlış; details açma; translit=false; orphan/readerUnknown; undo; aynı cevabın tekrarı. |
| 04/05/06 | 13×30/60 sn’nin cap=5 ile 5 dk görünmesi; plan sonrasında alınan snapshot. | 5/10/15 dk; 0/bozuk/50+ latency; gerçek medyan; plan öncesi snapshot; due/resume; mastery/repair. |
| 07 | Tek doğruyla sıkılma; yalnız regex ile okunuş gizleme iddiası. | 0/1/7/8 sonuç; p=.92 ve >.92; Latin görünür/katlı/yok; H4 sunumu. |
| 08/09 | ar+meaning alanlarını örnek sayma; ≤3 ile 2/3 ayrımını örtme. | Doğrulanmış örnek/künye; eksik örnek; normal 3/kolay 2; yardımlı grade=2; yalnız UI kuyruğu. |
| 10/11 | Test answer’dan sırayı biliyor ama öğrenciye hedef yok; harfler ayrı kutuda. | Anlam ipucu; cevap sızıntısı yok; birleşik RTL; tekrar eden harf; gerçek harf adı; order korunur. |
| 12 | Tek fixture geçiyor; eksik tür havuzu başka POS ile dolduruluyor. | Bütün uygun lemma × 2 yön × çoklu seed; dört şık/tek doğru/POS/kök/tekillik; eksik havuz yedeği; sızıntı yok. |
| 13 | İlk dokunuş indeksi ilerletiyor; eski callback ikinci kez ilerletiyor. | Slow 1600 ms → duraklat → Devam; fast 600 ms; yanlış manuel; ayar kapalı; klavye. |
| 14/15 | Ses kapalı/sessiz saatte çalma; hiç ended yokken bütün satır yaldızlı. | İzin matrisi; gerçek start/ended; sessiz yedek; reduce; exit/restart/error cleanup. |
| 16 | İkinci ended sonrası render 1→1; tekli seçili 3 yerine 0. | Olay sonrası gerçek HTML’de aria-current değişir; 3→3; son/error/exit temizliği. |
| 17 | Cancel cevap üretiyor; drop+click iki cevap üretiyor. | Cancel/dışarı/hareketsiz=0; geçerli drop=1; klavye/tap=1; cleanup; NaN; eski pointer. |
| 18 | Yalnız normalize fixture ile saflık iddiası. | null/undefined/boş/eksik/normalize/deep-frozen; çıktıyı değiştirmek girdiyi etkilemez; save=0. |
| 19/20 | Öğretim örneğinin tamamı details; yalnız Arapça satırını sayma. | Görünür çekirdek; summary dahil ilk görünüm; 109 goal≤25, intro/concept≤45; goal/apply eşliği. |
| 21/29 | sticky varlığı veya tema etiketiyle kabul; onboarding için log yok. | CTA farkı≤8 px; altı gerçek tema/genişlik; safe-area; örtüşme yok; manifest/log/görüntü eşliği; 30 glif. |
| 22/23 | İlk giriş adımını veya harf dokunuşlarını saymama; yalnız ilk parçayı ders sayma. | Giriş≤2; aynı u01.01 tam ders≤40; görev/lemma/FSRS kapsamı korunur; pause/off ayrı. |
| 24/25 | R2’yi gizleyip genel hedefi PASS yapma; boş kohort. | Onaylı pay/payda; R1/R2/R3/R4 ayrı; yeni/yerleşik/karma; özgün NOT_MET korunur. |
| 26 | Bütün günlerdeki 20/26 ile kesim sonrası 7/13’ü yeşil gösterme. | Kesim/bugün/gelecek gün/az veri/legacy H4/proxy durumları; çıktı sızıntısı yok. |
| 27 | SKIP exit 0’ı freeze PASS sayma; dört modülden biri eksik. | Gerçek girdiler; dört bayt eşliği; önce/sonra hash aynı; cmap 105/105; geçici alan temiz. |
| 28 | Child exit 1, sıfır fixture, eksik metrik, NaN veya SKIP ile final yeşil. | Her mutation nonzero; onaylı sapma ayrı; göreli perf istisnası mutlak tavanı açmaz. |
| 30/31 | Eski 37/37 veya yayını yeni düzeltme başarısı sayma. | 37 özgün kart ve 34 ardıl kart ayrı; sayım, kanıt seviyesi ve açık dış doğrulamalar. |
| 32/33 | Eski yayın onayı/workflow veya yalnız HTTP 200 ile parity. | Exact aday SHA; pin borcu sıfır; bütün URL hashleri; remote/workflow/live ayrı; onay yoksa yazma yok. |

## 6. Bağımsız denetleyiciye verilecek odaklı prompt

Aşağıdaki metin tek kart denetimi içindir. “Seçili ID”, uygulayıcının gerçekten teslim ettiği ID’dir; boş bırakılırsa denetim başlamaz. Denetleyici kullanıcı onayını veya eksik kanıtı kendi çıkarımıyla doldurmaz.

```text
Rolün bağımsız K3PD kabul denetçisi. Repo /Users/m_ras/Desktop/seyma.
Seçili ID: kullanıcının bu oturumda açıkça belirttiği tek K3PD-NN.

Önce Jev ve canlı AGENTS/CLAUDE güvenlik kurallarını uygula. Şu iki dosyayı oku:
kao3-premium/duzeltme-plani/PROMPTLAR.md (§1–§5 + yalnız seçili kart)
kao3-premium/duzeltme-plani/DENETLEYICI.md (ilgili bulgu, kapı, negatif matris).

Varsayılan salt-okur denetim yap; düzeltme uygulama. Git HEAD/branch/status,
seçili kartın baseHead/diff/allowlist ve önceden kirli yollarını doğrula.
00 öncesi ardıl state/araç yokluğu beklenir; 00 sonrası yalnız yeni DURUM,
GUNCEL-DURUM, KAYIT ve durum.mjs sırayı belirler. Eski37/37 yeni kanıt değildir.

Her kabul maddesini ayrı numarala. Prompt→gerçek karar→diff→kaynak→test
→son HEAD→gereken görsel/remote kanıt zincirini kur. Davranış testi ve negatif
sınırları çalıştır; önce bütün yan etkileri incele. Aynı üretim yardımcısından
beklenen sonuç türeten testi bağımsız kanıt sayma. Test gevşemesi, SKIP, sıfır
fixture, missingmetric ve sahte PASS ihtimallerini gitdiff’inde araştır.

Çıktı: (1) snapshot/scope, (2) kabul maddesi başına verdict ve path:line,
(3) komut/env/gerçek exit/ölçü/payda, (4) öncelikli kusurlar+repro,
(5) eski kart ve kardeş regresyonları, (6) accepteddeviation/haricigates,
(7) genel hüküm ve tam kalan iş. Kanıt yoksa UNVERIFIABLE veya NOT_MEASURED.
Kod/test/state/ledger/pin yazma; düzeltme önerisini sonraki uygulayıcıya bırak.
Bu kartın PASS’i sonraki uygulama veya yayın izni değildir.
```

Finaldenetim 31’de aynırol bütün açıkbulgulara ve 37 kartmatrisine genişler; bu, ayrı seçili 31 kartınınkapsamıdır. Denetleyicinin özgün makbuzu kendisi çalıştırmadıysa“yenidençalıştırdım”denmez. Araçyazmıyorken yenikapı çalışmışgibi raporlanmaz.

## 7. Başlangıç 37 kart matrisi — korunacak eski hüküm

Aşağıdaki tablo önceki bağımsız denetimin **başlangıçverdictidir**. Şimdi yeniden geçtiği veya düzeltildiği iddiası değildir.30/31’de ayrı yeniHEADsonucu eklenecek; bu kolon silinmez. Eski düzen tamstate executionOrder sırasıdır.

| Orijinal kart | Tarihsel uygulama commit’i | Başlangıç verdict | Yeniden kabul yönlendirmesi |
| --- | --- | --- | --- |
| K3P-00 | 51b1e183 + b0c7b744 | PARTIAL | 29: gerçekiki tema ve eski tabanı yanlış etiketleme |
| K3P-01 | 83b44832 | PASS | 12/25/31: dedup ve tarihseltemizseçimsırası |
| K3P-02 | 05512926 | PASS | 08/13/31: geri alma/metin/özet |
| K3P-03 | d2734897 | PASS | 05/06/31: 6 sntabanı/24 görev |
| K3P-04 | 084eb2fe | UNVERIFIABLE | 27: gerçekfreeze 4 byte eş |
| K3P-04B | 46559d88 | UNVERIFIABLE | 27: imlâkapsamıvefreeze |
| K3P-05 | 00737e2d | PARTIAL | 26/28: raporvebağlayıcıkapılar |
| K3P-A1 | 89efb2b1 | PASS | 13/15/16/21/31: overlaykimliği |
| K3P-A2 | bd691409 | PASS | 08/13/31: focus/toast |
| K3P-A3 | ce194ad3 | PARTIAL | 06/19/22/23: ritim/çekirdek |
| K3P-15 | 97c6d383 | PARTIAL | 05/13/23: medyan/şerit/40 tap |
| K3P-A4 | 8cb04b52 | FAIL | 04/05/06: gerçekbütçe |
| K3P-A5 | 9a78bd9a | PARTIAL | 07/08/09: DDA |
| K3P-A6 | c99de5e6 | UNVERIFIABLE | 21/29: beşbölüm/≤8 px |
| K3P-A7 | 84dd56c4 | PASS | 06/22/31: aynıgöreveresume |
| K3P-A8 | 64286530 | PARTIAL | 19/20: visibleörnek/bütçe |
| K3P-06 | bffcf660 | PASS | 19–23/31: tokenkorunumu |
| K3P-07 | c9dd5962 | PARTIAL | 27/29: font/30zor glif |
| K3P-08 | cc1a649c | PASS | 11/19–23/29/31: tipografi/hedef |
| K3P-09 | 8ef6915b | PASS | 19–23/29/31: materyal/kontrast |
| K3P-10 | 0823ae69 | PASS | 13–17/29/31: hareket/quiet |
| K3P-11 | 51e06c9e | PARTIAL | 18/29: safmodel |
| K3P-12 | 65a2b77d | PASS | 22/31: Bugün≤5/erişim |
| K3P-13 | 6dc12068 | PARTIAL | 14/15/20: ses/aynısatır/25 |
| K3P-14 | 8e9901cb | PASS | 06/15/23/31: gerçekkazanım |
| K3P-16 | 107a243d | PASS | 09–12/24–26/31: ladder/A–B |
| K3P-17 | d15558af | PARTIAL | 10/11/29: ipucu/birleşim/ARIA |
| K3P-18 | 367d667a | PARTIAL | 12/24/25: cloze/ölçü |
| K3P-19 | ae9a7481 | PARTIAL | 02/03/07/26: H4/sunum/şema |
| K3P-20 | 8a0642cb | PARTIAL | 17/29: dragcancel/klavye |
| K3P-21 | 671ba9da | PASS | 14/15/31: iki sesdüğmesi |
| K3P-22 | 3d680b2a | PASS | 06/22/31: enyakınâyet/eşik |
| K3P-23 | c5e73343 | PARTIAL | 16/29: gerçeksenkron/kart |
| K3P-24 | 658370ac | PASS | 18/31: ilerleme/tamsûre |
| K3P-25 | f5b068b4 + 9de24acb | PASS | 03/13/31: eskiayar/teklif/migration |
| K3P-26 | cd9ddfeb | PARTIAL | 27–31: görsel/ölçü/kapanış |
| K3P-27 | 6c10693c + d030610f | UNVERIFIABLE | 32/33: yeniaday/onay/yayın |

Sayım: 17 PASS + 15 PARTIAL + 1 FAIL + 4 UNVERIFIABLE = 37. 00…27 aralığında 28 kart, 04B ve 8 A kartı vardır. Yeni prompt işaretleri 34/34, eski prompt işaretleri 37/37’dir. Eski başlıktaki 36 bu sayımı değiştirmez.

## 8. Karar ve makbuz şablonları

Bunlar doldurulacak şablonlardır; gerçek karar veya çalıştırma değildir. Boş alan “onaylandı” anlamına gelmez. Verileri yalnız seçili kartın uygulayıcısı, gerçek kaynaklarıyla kaydeder.

### 8.1 Karar kaydının zorunlu alanları

- Karar ID, ilgili K3PD kartı, özgün hedef ve bulgu.
- Sorunun yeniden üretimi ve mevcut davranış.
- Seçenekler; önerilen seçenek ve gerekçesi; veri/şema/UX/ölçü/bütçe etkileri.
- Onaya sunulan somut fark veya taslak; tam olarak neye onay istendiği.
- Gerçek kullanıcı yanıtı, tarih, kaynak ve onaylayan rol. Ajan önerisi kullanıcı yanıtı değildir.
- Uygulanacak kesin sınır, açık kalan hedef, geri dönüş veya yeni karar koşulu.
- Hangi kartı açtığı ve hangi kart/remote işlemlerine yetki vermediği.

### 8.2 Kart makbuzunun zorunlu alanları

- ID, base HEAD, candidate HEAD veya diff hash, branch ve korunmuş kirli işler.
- Exact allowlist ve gerçek diff; kapsam genişlemişse onun açık onayı.
- Her kabul maddesi → kaynak path:line → sınama → gerçek sonuç → verdict.
- Kusuru yakalayan kırmızı test ve aynı sınamanın düzeltme sonrası sonucu; test değişikliği gerekçesi.
- Tam argv/cwd/env, gerçek exit kodu, süre, kohort/seed/tarih ve görev paydası; SKIP/timeout dahil bütün sonuçlar.
- Gereken runtime L6/L9, CSS/içerik/font ölçüleri; 45 App handler, schema/migrate ve içerik freeze sınırları.
- Sentetik kaynağın güvenlik kanıtı ve kişisel çıktı olmadığının doğrulanması.
- Bağımsız denetim hükmü, itirazlar, kalan dış doğrulamalar ve yalnız öneri olan sonraki aday.
- source_ready yalnız 11/21 için ve 29 bağımlılığıyla kullanılabilir; başka eksik kabul done yapılamaz.

### 8.3 Final rapor şablonu

1. Kapsam ve snapshot: branch, HEAD, yerel tracking, korunmuş kirli işler ve 34 kartın durumu.
2. Genel hüküm ve onu engelleyen ölçüler.
3. 37 özgün kartın başlangıç → son HEAD matrisi; 34 ardıl kartın durumu ayrı tablo.
4. F-01…F-14 kapanış kanıtları; yeni bulguların önceliği, kaynak yolu ve yeniden üretimi.
5. Komutlar, gerçek exit kodları, ölçüler, SKIP ve tarihsel araç sınırları.
6. Özgün hedef ve karar referansıyla kabul edilmiş sapmalar; dış kabul ve ölçülmeyen hipotezler.
7. Yayın varsa exact aday/remote/workflow/canlı hash ayrı; yoksa LOCAL_ONLY.
8. Değişen exact paths ve commit; kalan engeller ve sunucu cleanup kanıtı.

## 9. Gelecek yayın ve harici kabul sınırları

31 yerel teknik kabul, 32 pinli aday hazırlığı/onay talebi, 33 onaylı yayındır. Hiçbiri fiziksel cihaz, gerçek ekran okuyucu, L2 veya 230 kayıt incelemesinin yerine geçmez. Harici kontroller beklerken yalnız yerel teknik kapsam kapatılabilir; “bütün ürün kusursuz” sonucu çıkarılamaz. Kapsam içindeki hedef veya kanıt eksikliği dış gate diye sınıflandırılamaz.

Yeni H4 sayaç mantığı canlıya çıkmadan yeni deney kesimi başlatılmaz. Onaylı sözleşmeye göre ilk geçerli tam UTC günü türetilir; eski 2026-10-18 tabanı yanlış sayaç verisini düzeltilmiş yapmaz. 14/30 günlük takvim gerçek yeni yayına göre hesaplanır. Ajan kişisel veriyi kendi başına aramaz veya okumaz. Gerçek yedekle ayrı çalışma istenirse kullanıcı yerel girdiyi kendisi sağlar ve açık kapsam verir; chat üzerinden sır istenmez.

Eski 64/64 makbuzu ve Pages 39126116607 yeni sürüm kanıtı değildir. 33’te yeni public manifestin bütün URL’leri GET/hash ile karşılaştırılmadıkça uzak parite bekler. Ağ/credential engelinde son doğrulanmış yerel aday korunur; yeni commit veya deploy yapılmış gibi yazılmaz.

## 10. Bu iki belgenin kendi kabul kontrolü

- Tam 34 uygulayıcı prompt; başlangıç/bitiş ID’leri ve sıra eşleşir.
- Her prompt rol, bulgu, önkoşul, okuma listesi, exact allowlist, iş, kabul, doğrulama, hard stop, teslim ve sonraki aday içerir.
- F-01…F-14 en az bir karta ve final denetimine bağlıdır; 37 eski kart ayrı matriste korunur.
- 02/04/24 gerçek karar kapıları ve 11/21→29 geç kanıt istisnası açıktır.
- 00/28/32’de oluşturulacak araçların bugün henüz bulunmadığı belirtilmiştir.
- Bugünkü istekle yalnız iki Markdown dosyası oluşturulur; önceki üç kirli belge korunur.
- Yerel Markdown bağlantıları çözülür. Kod satırları locator’dır; canlı işlev adıyla tekrar bulunur.
- Yarım bölüm veya doldurulmamış taslak yoktur. §8 alanları bilinçli karar/makbuz şablonudur; kanıt değildir.
- Yeni okuyucu bu iki belgeden şu soruları cevaplayabilir: hangi tek ID yetkili; eski senkron neden program tamam der; kirli dosya nasıl korunur; hangi karar bağımlıları durdurur; hangi sayılar tarihsel tabandır; yerel, yayın ve cihaz kabulü nasıl ayrılır?
