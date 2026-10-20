import csv,json
from pathlib import Path
p=Path(__file__).resolve().parents[1];rows=list(csv.DictReader((p/'sources/iaea-ground-states.csv').open(encoding='utf-8')));items={}
for r in rows:
 if not r.get('z') or int(r['z'])==0:continue
 z,n=int(r['z']),int(r['n']);d={'z':z,'a':z+n,'symbol':r['symbol'],'massMicroU':r['atomic_mass'],'massUncMicroU':r['unc_am'],'bindingKeVPerNucleon':r['binding'],'bindingUncKeV':r['unc_ba'],'massSystematics':r['me_systematics'],'extracted':r['Extraction_date']}
 items[f'{z}:{z+n}']=d
(p/'nuclear-properties.js').write_text('/* Propriétés des seuls états fondamentaux existants ; aucune nouvelle population. */\nconst nuclearProperties='+json.dumps(items,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('Propriétés',len(items))
