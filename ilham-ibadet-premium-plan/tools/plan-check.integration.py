#!/usr/bin/env python3
# Validator-only synthetic tests; never executes product code or contacts the network.
from pathlib import Path
import tempfile,shutil,json,hashlib,subprocess
repo=Path(__file__).resolve().parents[2]; tmp=Path(tempfile.mkdtemp(prefix='iip-validator-',dir='/private/tmp'))
for child in repo.iterdir():
 if child.name!='ilham-ibadet-premium-plan': (tmp/child.name).symlink_to(child,target_is_directory=child.is_dir())
p=tmp/'ilham-ibadet-premium-plan'; shutil.copytree(repo/p.name,p)
s=json.loads((p/'IIP-STATE.json').read_text()); c=s['cards'][0]
# P12: baseline artık 24/24 done (plan tamamlanmış durumda). Sentetik senaryonun
# kendi TEMİZ başlangıcını kurması gerekir; aksi halde "card totals drift" ve
# "unauthorized status IIP-02..24" hataları üretir ve senaryo kendi amacını
# (yapısal olarak geçerli tek done kart) test edemez. Bu sıfırlama yalnız
# /private/tmp içindeki izole kopyada çalışır; üretim planına dokunmaz.
for _card in s['cards']:
  _card.update(status='planned',verifiedHead=None,diffHash=None,completedAt=None,
               startedAt=None,owner=None,locks=[],plannedWriteFiles=[],
               resourceLocks=[],blockedReason=None,evidence=[])
s['completedCards']=0;s['nextExecutableCard']=None
s['implementationApproval']={'status':'approved','cardIds':['IIP-01'],'source':'SYNTHETIC VALIDATOR TEST ONLY'}
s['completedCards']=1;c.update(status='done',verifiedHead=s['baselineHead'],diffHash='0'*64,completedAt='2026-09-19',handoff='evidence/IIP-01/HANDOFF.md')
# P12: shutil.copytree zaten evidence/IIP-01'i kopyaladığı için çıplak mkdir()
# FileExistsError veriyordu. Sentetik fixture için dizini TEMİZLE, sonra kur.
e=p/'evidence/IIP-01'
if e.exists(): shutil.rmtree(e)
e.mkdir(parents=True)
(e/'HANDOFF.md').write_text('Synthetic fixture, not product evidence.\n')
for gate in c['requiredGates']:
 artifact=f'evidence/IIP-01/{gate}.log'; (p/artifact).write_text('Synthetic '+gate+' fixture, not product proof.\n')
 details={'scope':{'changedFiles':[],'scopeReviewedBy':'fixture'},'requirements':{'results':[{'requirementId':rid,'testId':'TC-'+rid.split('-')[1],'result':'pass'} for rid in c['requirements']]},'review':{'findings':[],'openCritical':0,'openHigh':0,'reviewedBy':'fixture'}}[gate]
 receipt={'schemaVersion':1,'cardId':c['id'],'gate':gate,'status':'pass','artifact':artifact,'artifactSha256':hashlib.sha256((p/artifact).read_bytes()).hexdigest(),'verifiedHead':c['verifiedHead'],'diffHash':c['diffHash'],'createdAt':'2026-09-19','requirements':c['requirements'],'commands':[],'limitations':'SYNTHETIC TEST ONLY','reviewer':'fixture','details':details}
 dest=f'evidence/IIP-01/{gate}.json'; (p/dest).write_text(json.dumps(receipt));c['evidence'].append(dest)
(p/'IIP-STATE.json').write_text(json.dumps(s))
ledger=p/'tracking/LEDGER.jsonl'; ev=[json.loads(x) for x in ledger.read_text().splitlines()];ev.append({'seq':len(ev)+1,'at':'2026-09-19','event':'card_done','cardId':'IIP-01','verifiedHead':c['verifiedHead']});ledger.write_text(''.join(json.dumps(x)+'\n' for x in ev))
cmd=['node',str(p/'tools/plan-check.mjs')]
def run(expected,*args):
 r=subprocess.run(cmd+list(args),cwd=tmp,capture_output=True,text=True)
 if expected==0: assert r.returncode==0,r.stdout+r.stderr
 else: assert r.returncode!=0 and expected in r.stderr,r.stdout+r.stderr
run(0,'--render');run(0);print('PASS: valid synthetic done card accepted (isolated copy)')
a=p/'evidence/IIP-01/scope.log'; original=a.read_text();a.write_text(original+'tamper');run('artifact hash');a.write_text(original);print('PASS: tampered artifact rejected')
f=p/'cards/IIP-01.md'; original=f.read_text();f.write_text(original.replace('**Bağımlılıklar:** yok.','**Bağımlılıklar:** IIP-24.'));run('card contract drift');f.write_text(original);print('PASS: card/state contract drift rejected')
a=p/'evidence/IIP-01/review.json';r=json.loads(a.read_text());r['details']['openHigh']=1;a.write_text(json.dumps(r));run('review details');print('PASS: unresolved high review finding rejected')
print('Production plan unchanged; test artifacts:',str(tmp))
