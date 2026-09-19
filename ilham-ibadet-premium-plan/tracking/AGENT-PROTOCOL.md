# IIP — bütün ajanlar için çalışma sözleşmesi

Bu kurallar yalnız `ilham-ibadet-premium-plan/` planını yönetir. Kök veri güvenliği kuralları geçerlidir. Bu klasör üretim script listelerine bağlanmaz.

## Yetki sırası ve tek gerçek durum

Güncel kullanıcı talimatı → kök AGENTS güvenlik/scope → `IIP-STATE.json` yürütme kaydı + REQUIREMENTS/DECISIONS kayıtları → kartın bunlardan üretilen sözleşmesi → üretilmiş pano. Yetki JSON tarafından verilmez; JSON mevcut yetkinin kaydıdır. Çelişkide kullanıcının talimatını kaynak olarak kaydet, planı uzlaştır; daha önce verilen izni tekrar sorma.

- `IIP-STATE.json`: kart, bağımlılık, sahip, kilit, izin kapsamı, kanıt dizisi ve durum.
- `tracking/REQUIREMENTS.json`: her REQ için tek kart ve TC.
- `tracking/LEDGER.jsonl`: append-only olaylar; geçmiş olay değiştirilmez, düzeltme yeni olaydır.
- `tracking/CURRENT-STATE.md`, `TRACEABILITY.md`, `DEPENDENCIES.md`: script çıktısı, elle yazılmaz.
- `cards/IIP-NN.md`: iş sözleşmesi; status tekrarı yok.
- `evidence/IIP-NN/`: gerçek artifact ve receipt; template burada kanıt olarak kullanılamaz.

## Durum geçişi

`planned → in_progress → implemented → in_review → done`.
Her açık durumdan `blocked` olabilir; `blockedReason` çözülünce önceki işe `in_progress` ile dönülür ve ledger'a yazılır. `done → in_progress` yeniden açma için neden ve eski kanıtın geçerliliği kaydedilir. Geçmiş done kanıtı silinmez, yeni receipt üretilir.

`implemented` kod/artefact üretildi demektir; PASS değildir. `done` yalnız kartın gerekli yerel gate'lerinin geçtiği ve incelemesinin tamamlandığı anlamına gelir. `deviceAcceptance` ve `releaseApproval` ayrıdır. Görsel kart visual receipt olmadan done olmaz. Editoryal kart content receipt olmadan done olmaz. Bitmeyen iş sırf bütçe/süre nedeniyle done yapılamaz.

## Birden çok ajan ve yazma sahipliği

Varsayılan tek uygulayıcı; paralellik yalnız mevcut kullanıcı/uygulanan beceri yetkisi varsa. Read-only review bağımsız olabilir. Integratör state/ledger/pano tek yazarıdır; diğer ajanlar kendi kart artifact/devirlerini yazar, integratöre bildirir.

1. Başlamadan state'te owner ve düzenlenecek dosyaların tam yollarını `locks` olarak kaydet. Lock bir koordinasyon kaydıdır, OS kilidi değildir; Git dirty kontrolü de gerekir.
2. `saygi.js` veya `styles.css` paylaşan kartlar bağımsız DAG dalında olsa da aynı anda yazılmaz.
3. `data`, `state.js`, `sync.js` ve migration için tek yazıcı. Ayrı worktree bile veri sözleşmesi koordinasyonunu kaldırmaz.
4. `index.html` cache-bust yalnız integratör; her kart ayrı bump yapmaz.
5. Ajan bittiğinde lock bırakır, devir verir; integratör diff ve ilgili testleri kendi doğrular. Başka ajanın PASS ifadesi tek başına kanıt değildir.
6. Çöken ajan kilidi otomatik süre aşımıyla çalınmaz; integratör dirty dosyaları ve yarım işi inceleyip yeni devir olayıyla devralır.

## Kanıt düzeni

Receipt: `schemaVersion/cardId/gate/status/artifact/verifiedHead/diffHash/createdAt/requirements/commands/limitations/reviewer`. Gerçek sonuç, komut ve exit code gerekir. Screenshot için sentetik veri, tema, viewport ve gözlem; review için bulgu/kapanış kaydı. Receipt SHA uyuşmazlığı yeniden doğrulama ister. Dirty değişimi tanımlamak için kaynak HEAD'e ek diff hash veya untracked artifact manifesti gerekir.

## Değişiklik ve kesinti

Göreve yeni dosya/şema/API eklemek gerekiyorsa [CHANGE-REQUEST](../templates/CHANGE-REQUEST.md) doldur. Bağımlılık/scope değişirse önce state/kart/REQ eşlenir, `plan-check` geçer. Kullanıcı zaten aynı kapsamı onaylamışsa gereksiz yeni onay isteme. ID yeniden numaralama yok; yeni kart eklenecekse yeni ID ve DAG gerekir.

Her oturum sonunda HANDOFF; aktif işin sahipliği, dirty dosyalar, son komut, kalan kabul, sonraki yetkili eylem. Kullanıcı verisi/token rapor veya fixture'a girmez. Sunucu başlatıldıysa kendi sürecini kapat; bu plan tarayıcı açma yetkisi vermez.

## V2 inceleme sonrası mekanik kurallar

`plannedWriteFiles` oturumda gerçekten yazılması planlanan üretim/test yollarıdır; `locks` ile aynı küme olmalı. `dataAffecting=true` kartında `resourceLocks` içinde `data-writer` gerekir; başka aktif kart aynı kaynağı tutamaz. Allowlist yazılabilecek üst sınırdır, kilit yazma planıdır. Yeni yazma ihtiyacı önce kayda alınır.

Kararlar `tracking/DECISIONS.json` içindedir. `approved` kararı reviewer, kaynak ve gerçek kanıt dosyası gerektirir. Kullanıcının yetkilendirdiği rutin uygulama seçimi için gereksiz soru yok; veri/paylaşım gibi açık kullanıcı kararı gereken durumda kaynak yetki gösterilir. Kartın `decisionIds` kararları kapanmadan done olamaz; bağımlı kartlar da bu sayede erken başlayamaz.

Kart içindeki `CONTRACT` bölümü JSON'lardan üretilir ve checker karşılaştırır; bağımlılık, allowlist, gate, REQ kabulü ve kararlar burada tek kez bulunur. Diğer düz yazı ile çelişki varsa bağımsız review bulgusu açılır; mekanik kontrol doğal dildeki her çelişkiyi yakalayamaz.
