# K3PD-31 final denetim (AÇIK — kapanmadı)

Tarih: 2026-10-29 · baseHead: bkz. DURUM.json K3PD-31.

## Geniş yavaş kapı (`kapi.mjs --final --yavas`) — sandbox içinde
Sonuç: **FAIL**, 225 test; 9 exit 1, 3 SKIP işareti (test_kao2_lemma_morph, test_iip_11, test_panel_p2_polling).
Neden: kapı alt süreç ortamını temizler ve `TMPDIR`'i atar; sandbox `/tmp` yazımına `EPERM` verir (`mkdtemp /tmp/kao-freeze-repro-…`, `open /tmp/k3pd21-matrix-….json`). Bu bir ortam artefaktıdır. 9 başarısız test (test_k3p_progress, test_k3pd_control, test_kao2_curriculum, test_kao2_kabul, test_kao2_review_apply, test_kao2_syllable_audio, test_kao_freeze_repro, test_deploy_surface_contract, test_local_visual_qa_manifest) normal ortamda tek tek **exit 0** verdi; bu **kapı PASS'i değildir**.

## Açık
- Kapının sandbox dışında temiz koşusu ve saklanmış çıktısı.
- Üç SKIP'li testin nedeni.
- Bağımsız final denetim (yapılmadı).
- Teknik final PASS yoktur; `releaseApproval=NOT_APPROVED` kalır.

Kullanıcı 2026-10-29'da bu haliyle push/merge/deploy istedi; üretim kodu bu kayıtlarla değişmez (canlı pin 20261029a, `746ecdd2`).

Seq 215: sandbox dışı koşu için baseHead güncellendi.

Seq 216: Kullanıcı kararıyla ACCEPTED_DEVIATION ile kapandı; kapı tamamlanmadı, bağımsız final denetim yok, teknik final PASS değil.

## Ek (2026-10-29, sandbox dışı koşu tamamlandı)
`kapi.mjs --final --yavas` sandbox dışında bitti: **225 testin 225'i exit 0**, hiçbirinde hata yok. Kapı yine de **FAIL** (exit 1) verdi, çünkü 4 testin çıktısında "SKIP" kelimesi geçti (`kapi.mjs:113/525` düz regex): `test_kao2_lemma_morph` (test adı "yoksa SKIP"), `test_iip_11` ("skip targets/skip control"), `test_local_visual_qa_manifest` ("çekim hatası SKIP olarak yutulmuyor"), `test_panel_p2_polling` ("input skip UI'da görünür"). Bunlar test adlarıdır; **gerçek atlama değil** (çıktı satırları doğrulandı). Kapı regex'i kelime eşlemesi yaptığı için sahte pozitiftir; düzeltmek kapı aracında kod değişikliğidir ve bu kartın kapsamı dışındadır (ayrı kart). Koşu, kart durumu sonradan değiştiği için (31/32/33 kapatıldı) kapsam kontrolü açısından resmî kabul kanıtı değildir.

Sonuç: teknik kanıt, önceki "9 başarısız" iddiasından güçlü: ortam artefaktı giderilince gerçek hata yok. K3PD-31 hükmü `ACCEPTED_DEVIATION` olarak kalır (bağımsız final denetim yok, kapı formal olarak yeşil değil).
