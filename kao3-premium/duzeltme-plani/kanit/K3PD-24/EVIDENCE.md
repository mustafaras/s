# K3PD-24 — Tanıma oranı ölçümü ve onaylı karar

## Kapsam ve taban

- Kart: K3PD-24; branch: k3pd-denetim-duzeltmeleri; başlangıç HEAD: 753ecbe6035e61ad1b2d4d0057957942f1bff19d.
- K3PD-23 done/PASS, K3PD-24 canlı sıradaki kart. K3PD program releaseApproval=NOT_APPROVED.
- Karar: kullanıcı K3PD-24 için önerilen A’yı ve yalnız bu karta ait exact-path allowlist onarımını 2026-10-24’te onayladı. Eşleşen yanıt/sourceRef karar makbuzu: KAYIT.md seq 120.
- Kart bu ölçüm sözleşmesini ve kararı kaydeder; motor, scheduler, eşik, K3P-STATE ve ölçüm sınıflaması değişmez. K3PD-25 başlamadı.
- Korunan kirli dosyalar kart kapsamı dışındadır: kao3-premium/KAPANIS.md, kao3-premium/README.md, kao3-premium/kanit/sonraki/GORSEL-KANIT.md ve .pdf.
- Üretim, scheduler, K3P-STATE, cift-sik.cjs, test veya ölçüm sınıflaması değiştirilmedi.

## Kesin sınıflar

| Sınıf | Tanım | Bu karttaki pay/payda ilişkisi |
| --- | --- | --- |
| R1 tanıma | Dört seçenekten Arapça→anlam tanıma. B kolu daima R1; A kolunda s<3 de R1. | Yeni/ilk tanış görevinde de üretilebilir; ayrı cohort çapraz tablosunda görünür. |
| R2 eşleme | Ses→anlam veya anlam→Arapça seçme. Bu da çoktan seçmeli görevdir. | R1 payına girmez; R1–R4 tekrar paydasında yer alır ve ayrıca sayılır. |
| R3 üretim | Harflerden kelime kurma; doğru cevap birden çok çip seçer. | Çoktan seçmeli sayılmaz; tekrar paydasında R3 olarak raporlanır. |
| R4 cloze | Doğrulanmış âyet bağlamında eksik kelimeyi seçeneklerden seçme. | Çoktan seçmelidir; R1 payına girmez, R1–R4 tekrar paydasında R4 olarak görünür. |
| Yeni tanış / isNew | Task’ın isNew=true işareti. Aynı task ayrıca R1/R2 rung’u taşıyabilir; bu yüzden kohort boyutu olarak çapraz raporlanır. | R1 tekrar hedefinin payına/paydasına girmez. |
| Intro ekranı | Ders planındaki kind=intro bilgi/öğretim ekranı; kabul edilen bir cevap görevi değildir. | Cevap görevi paydasına dahil edilmez; bu kartta ekran adedi ölçülmedi. |

### Pay, payda ve kohort sözleşmesi

- **Eski genel ≤%60 hedefi:** her tam ders taramasındaki numerator = R1+R2+R4 gerçek tek-seçim çoktan seçmeli kelime cevap-görev ziyaretleri; denominator = aynı yeni kullanıcı veya yerleşik sentetik profilinde `H.playLesson` tarafından ziyaret edilen bütün cevap-görevleri (kelime ve kelime dışı görevler; her görev bir kez). R3 çok çipli üretim olduğu için numerator’a girmez; paydada bir görev olarak kalır. `isNew=true` tanış kelime cevap-görevi genel ölçüde yer alır; yeni tanış intro ekranı cevap-görevi değildir. Yeni ve yerleşik profiller ayrı raporlanır.
- **Onaylanan ek olgun tekrar R1 hedefi:** numerator = `isNew=false` tekrar kelime görevleri içinde R1 görev sayısı; denominator = aynı sabit s=5/12/40 karışık tekrar kohortundaki R1+R2+R3+R4 kelime görevlerinin toplamı. İki kol birlikte ana sonuçtur; A/B kol kırılımı da raporlanır. R2 açıkça çoktan seçmeli olarak ayrıca sayılır; R4 de çoktan seçmelidir, R3 üretimdir. Bu ayrı hedef genel metriğin yerine geçmez.
- Her payda görev ziyareti sayar; bir görevin birden çok çip dokunuşu birden çok görev veya cevap sayılmaz. Paydalar yeni görev ekleyerek ya da intro ekranı ekleyerek büyütülmez.

## Güncel HEAD’de yeniden üretim

Kartta ve DENETLEYICI.md başlangıç tabanında verilen 92.92% yeni, 91.57% yerleşik ve 48.94% karma oranlar tarihsel referanstır; bunlar bu HEAD’de yeniden üretilmedi. Eski yerleşik oranı için tarihsel kaynaklar kendi aralarında uyuşmuyor: DENETLEYICI.md 91.57% derken K3P-STATE/LEDGER 1030/1127 = 91.39% kaydeder. Bu eski sayı farkı çözülmüş gibi sunulmuyor; iki değer de %60 genel hedefin karşılanmadığını gösterir. Güncel HEAD ölçüleri aşağıda ayrı verilir.

Komut: node kao3-premium/araclar/cift-sik.cjs

Exit 0. Bu exit, çift şık kontrolü ile sentetik karma tekrar R1≤60 kontrolünü ifade eder; genel ≤60 hedefini PASS saymaz.

| Sentetik profil | Bütün cevap görevleri D | Kelime görevi | isNew kelime | Tekrar kelime | R1 toplam | R2 toplam | R3 build | R4 | cift-sik raw choices/D |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Yeni / fresh | 1084 | 1010 | 1010 | 0 | 912 | 98 | 0 | 0 | 1010/1084 = %93,17 |
| Yerleşik / seeded | 1119 | 1028 | 972 | 56 | 900 | 122 | 6 | 0 | 1028/1119 = %91,87 |

Yerleşik profilde raw choices sayısı, choices dizisi taşıyan 6 R3 build görevini de içerir. Bunlar çoktan seçmeli değildir. Gerçek MC sınıflaması R1+R2+R4 olduğundan 1022/1119 = %91,33 olur. Yeni profilde R3 yoktur; mevcut MC payı 1010/1084 = %93,17’dir.

### A/B ve cohort çapraz sayımı

| Profil ve cohort | B/R1 | A/R1 | A/R2 | A/R3 | A/R4 | Görev sayısı |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Yeni profil, isNew=true | 523 | 389 | 98 | 0 | 0 | 1010 |
| Yerleşik, isNew=true | 508 | 371 | 93 | 0 | 0 | 972 |
| Yerleşik, isNew=false | 21 | 0 | 29 | 6 | 0 | 56 |

Geri kalan nonword cevap görevleri yeni profilde 59 grammar + 15 order = 74; yerleşik profilde 59 grammar + 17 meaning + 15 order = 91. Bu türler kelime rung sınıfları değildir. Tablo, isNew cohort’unu rung’la çaprazlar; bir task’ı iki ayrı toplamda sayıp paydayı büyütmez.

### Olgun karma tekrar kohortu

Komut: node kao3-premium/araclar/cift-sik.cjs

| Ölçüm | Ders kartı | Tekrar görev paydası | R1 tanıma | R2 eşleme | R3 üretim | R4 cloze |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| K3P-18 tarihsel kayıt, seq 52 | 814 | 1324 | 648 (%48,94) | 383 | 237 | 56 |
| Güncel HEAD, s=40/12/5 karışımı | 812 | 1316 | 648 (%49,24) | 403 | 224 | 41 |

Güncel kohort K3P-18’in deterministik yöntemini kullanır: derste kullanılan kelime kartları alınır, üçte biri s=40, üçte biri s=12, üçte biri s=5 ile tekrar görevi olarak kurulur; isNew görevleri dışarıda kalır. B kolu R1’de kalır. Sonuç sentetik görev türü ölçümüdür; retention, öğrenme etkisi veya gerçek kullanıcı kohortu ölçülmedi.

#### Onaylanan A hedefi için kol kırılımı

| Kol | Tekrar görevleri | R1 | R2 | R3 | R4 |
| --- | ---: | ---: | ---: | ---: | ---: |
| A | 668 | 0 | 403 | 224 | 41 |
| B | 648 | 648 | 0 | 0 | 0 |
| Toplam | 1316 | 648 | 403 | 224 | 41 |

Kol × atanmış s çaprazı: A/s=40 → R2=74, R3=109, R4=41 (224); A/s=12 → R2=100, R3=115 (215); A/s=5 → R2=229 (229). B/s=40,12,5 → R1=218,231,199 (648). Böylece iki kolun birleşik birincil oranı R1=648/1316=%49,24’tür ve B görevlerinin tamamı R1 olarak doğrulanır.

Yeniden üretim: repo kökünden aşağıdaki Node kodunu stdin’e ver; exit 0, 812 kart ve 1316 tekrar görevinde yukarıdaki sayımları üretir.

~~~js
'use strict';
const H = require('./tests/kao/helpers/kao-harness.js');
function lessonWordCardIds() {
  const t = H.bootKao({ seeded: true });
  const ids = new Set();
  for (const unit of t.win.QuranCurriculumV2.units) for (const lesson of unit.lessons) {
    t.ui.kaoLesson = null;
    if (!t.api.kaoLesson('start', lesson.id)) continue;
    H.playLesson(t, { visit(task) { if (task.type === 'word') ids.add(task.cardId); } });
    t.api.kaoLesson('exit');
  }
  return [...ids].sort();
}
const ids = lessonWordCardIds();
const t = H.bootKao({ seeded: false });
H.freshUser(t);
ids.forEach((id, i) => {
  t.data.quranLearn.cards[id] = {
    state: 'review', s: i % 3 === 0 ? 40 : (i % 3 === 1 ? 12 : 5),
    reps: 8, due: '2026-09-29T00:00:00.000Z'
  };
});
const flow = t.win.SeymaQuranLearnFlow;
const byArm = {
  A: { total: 0, R1: 0, R2: 0, R3: 0, R4: 0 },
  B: { total: 0, R1: 0, R2: 0, R3: 0, R4: 0 }
};
for (const unit of t.win.QuranCurriculumV2.units) for (const lesson of unit.lessons) {
  t.ui.kaoLesson = null;
  if (!t.api.kaoLesson('start', lesson.id)) continue;
  H.playLesson(t, { visit(task) {
    if (task.type !== 'word' || task.isNew) return;
    const arm = flow.ladderArm(task.cardId);
    const row = byArm[arm];
    row.total += 1;
    const rung = task.rung === 'R1' ? 'R1'
      : task.kind === 'cloze' ? 'R4'
        : task.kind === 'build' ? 'R3' : 'R2';
    row[rung] += 1;
  } });
  t.api.kaoLesson('exit');
}
console.log(JSON.stringify({ cards: ids.length, tasks: byArm.A.total + byArm.B.total, byArm }, null, 2));
~~~

## Hedefin uygulanabilirliği ve alternatif

Genel hedefin current raw numerator’ı R1+R2+R4 kelime görevleridir; denominator cift-sik harness’inin tüm cevap görevi ziyaretleridir. K3PD-24’te bu sınıflama kodda değiştirilmedi. R3 build, raw script’in choices sayacına girebilse de üretim cevabı çok çipli sıralama olduğundan gerçek MC kabul edilmedi.

| Profil | Gerçek MC mevcut / D | ≤%60 için MC üst sınırı | En az MC görevi dönüşmeli | Mevcut R1 |
| --- | ---: | ---: | ---: | ---: |
| Yeni / fresh | 1010/1084 (%93,17) | 650 | 360 | 912 |
| Yerleşik / seeded | 1022/1119 (%91,33) | 671 | 351 | 900 |

Mevcut tasarımda yeni kart/s<3 R1, B kolu daima R1 kalır. Bu yüzden yalnız A’daki R2 görevlerini üretime çevirmek yetmez: yeni profilin 912 R1 görevi, 650 üst sınırını 262 aşar; yerleşik profilin 900 R1 görevi, 671 üst sınırını 229 aşar. Genel ≤60’ı yeni cevap görevi ekleyerek veya yeni tanış görevlerini paydaya ekleyerek sağlama kartın hard stop’una aykırıdır.

Genel hedefi gerçekten sağlamak isteyen B seçeneği, aynı denominator’ı koruyarak A tarafında ek tasarım değişikliği ister:

- Yeni profilde 98 A/R2 görevine ek olarak en az 262 A/R1, toplam en az 360 MC görevini üretim türüne çevirmek gerekir. B/R1 kontrolü 523 görev olarak kalır.
- Yerleşik profilde 122 A/R2 görevine ek olarak en az 229 A/R1, toplam en az 351 MC görevi üretime çevirmek gerekir. B/R1 kontrolü 529 görev olarak kalır.
- Bu, A kolunda mevcut s<3 R1 merdiven kuralını aşar ve ilk tanış görevlerinde üretim ister. A/B kontrastı yeni olarak “tanı/eşle” ile “üret” olur; eski merdiven etkisi karşılaştırması korunmaz.
- R1/R2 tek seçimli notlamadan R3 çok çipli yanıta geçilir; doğru/yanlış grade tek tamamlanan dizi üzerinden verilir, hatalar order sınıfına girer. Hata oranı, grade dağılımı ve FSRS aralıkları değişebilir. Bu ürün ve deney tasarımı değişikliği K3PD-24 kapsamı dışındadır.

## Karar kaydı — A onaylandı

Kullanıcı yanıtı aynen: “tümünü ve önerilerini onaylıyorum” (2026-10-24). Bu yanıt, hemen önce sunulan seçeneklerden önerilen A’nın ve yalnız K3PD-24 allowlist satırı exact-path onarımının onayı olarak kaydedildi. Eski genel ≤%60 hedefi kaldırılmadı veya yeniden tanımlanmış gibi gösterilmedi: genel all-task MC payı görünür `NOT_MET` kalır. Buna ek olarak, yukarıdaki kesin pay/payda ile olgun tekrar R1≤%60 hedefi önkayıtlandı. Önceki K3P-18 karma örnek kararı genel hedef feragati değildir. K3P-STATE hedefi ve ölçüm kodu bu kartta değişmez.

### B — Onaylanmayan karşıolgusal alternatif

A seçeneğindeki genel hedefi davranışsal olarak sağlamak için ölçülen yeni profilde en az 360, yerleşik profilde en az 351 MC görevi üretime dönüştürülmelidir. B kontrolü R1 olarak kalır; dönüşüm A kolunda yeni/s<3 görevlerini de kapsar. Bu, mevcut A/B sorusunu ve grade/FSRS dağılımını değiştirir; ayrıca öğretim ve deney tasarımı için ayrı çalışma gerekir. Kullanıcı bu seçeneği onaylamadı; K3PD-24 bu tasarım değişikliğine yetki vermez.

### C — Başka hedef veya yöntem

Yanıtta tam hedef yüzdesini; numerator, denominator, cohort, isNew filtresi ve R1/R2/R3/R4 sınıflamasını belirt. Eski genel seride kabul edilmiş bir sapma seçilecekse kapsamını açıkça tanımla; K3P-18 karışık örnek onayı genel hedef feragati sayılmaz.

## Doğrulama ve açık sınırlar

- node kao3-premium/araclar/cift-sik.cjs — exit 0; 0/1084 ve 0/1119 çift şık; karma tekrar R1 %49,24.
- node - (aşağıdaki inline H.playLesson cohort sayımı) — exit 0; iki cohort ve A/B × isNew × rung sayımları tekrar üretildi.
- node kao3-premium/duzeltme-plani/araclar/durum.mjs --check — ilk deneme exit 1 ile recognition state/KAYIT sourceRef eşleşmesini yakaladı; sourceRef ardından eşitlendi ve seq 120’de gerçek hata kaydedildi. Exact allowlist hatası, kullanıcının açık onayıyla yalnız K3PD-24 PROMPTLAR satırını onararak giderildi.
- `node kao3-premium/duzeltme-plani/araclar/durum.mjs --check` ve `--sonraki` kapanış state’inde exit 0; son sonuçlar KAYIT.md seq 127’dedir. İlk geçici hatalar seq 117 ve seq 120’de açıkça tutulur.
- Üretim, scheduler, cift-sik, K3P state ve test diff’i 0.
- Genel hedefin doğru gelecekteki ölçüm sınıflaması bu kararda değiştirilmedi; motor/test eşiği değişikliği K3PD-25’e aittir.
- Gerçek kullanıcı kohortu, cihaz kabulü ve bilimsel kalıcılık kanıtı yok; bu sentetik oranlar öğrenme etkisi veya kalıcılık iddiası değildir. Bağımsız hüküm PASS yalnız bu kartın belge ve ölçüm sözleşmesine aittir; gerçek kullanıcı/kalıcılık/cihaz kabulü anlamına gelmez. `releaseApproval=NOT_APPROVED`.
- İlk bağımsız read-only inceleme PARTIAL verdi: karma tekrar kohortunun A/B kırılımı kanıtta yoktu ve DURUM.json’da bu kartla ilgisiz `1e-06` gösterimi ondalık biçime dönüşmüştü. A/B tablosu ve çalıştırılabilir sonda eklendi; ilgisiz sayı HEAD’deki gösterime döndürüldü. Bağımsız focused re-audit PASS: gömülü A/B sonda exit 0; durum `--check`, `--sonraki`, `git diff --check`, beş exact-path allowlist/scope eşliği ve kod diff guard PASS. KAYIT.md seq 126 final verdict’i kaydeder.

### Yeniden üretilebilir task×cohort sayımı

Kökten komut: node - <<'NODE' (bu betiği stdin’e ver)

~~~js
'use strict';
const path = require('node:path');
const H = require(path.join(process.cwd(), 'tests', 'kao', 'helpers', 'kao-harness.js'));

function scan(seeded) {
  const t = H.bootKao({ seeded });
  if (!seeded) H.freshUser(t);
  const flow = t.win.SeymaQuranLearnFlow;
  const out = {
    cohort: seeded ? 'established_seeded' : 'new_fresh',
    total: 0, nonWord: 0, word: 0, newWord: 0, repeatWord: 0,
    hasChoices: 0, byRung: {}, byKind: {}, byArm: {}, newByKind: {}, nonWordKinds: {}
  };
  const inc = (obj, key) => { obj[key] = (obj[key] || 0) + 1; };
  for (const unit of t.win.QuranCurriculumV2.units) {
    for (const lesson of unit.lessons) {
      t.ui.kaoLesson = null;
      if (!t.api.kaoLesson('start', lesson.id)) continue;
      H.playLesson(t, { visit(task) {
        out.total += 1;
        if (task.type !== 'word') {
          out.nonWord += 1;
          inc(out.nonWordKinds, String(task.kind || task.type));
          return;
        }
        out.word += 1;
        const isNew = !!task.isNew;
        if (isNew) out.newWord += 1;
        else out.repeatWord += 1;
        const rung = String(task.rung || 'none');
        const kind = String(task.kind || 'none');
        if (Array.isArray(task.choices)) out.hasChoices += 1;
        inc(out.byRung, rung);
        inc(out.byKind, kind);
        if (isNew) inc(out.newByKind, kind);
        const arm = task.cardId ? flow.ladderArm(task.cardId) : 'none';
        inc(out.byArm, (isNew ? 'new' : 'repeat') + ':' + arm + ':' + rung + ':' + kind);
      }});
      t.api.kaoLesson('exit');
    }
  }
  return out;
}

console.log(JSON.stringify([scan(false), scan(true)], null, 2));
~~~
