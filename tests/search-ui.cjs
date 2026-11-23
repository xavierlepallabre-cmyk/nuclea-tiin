// Recherche globale (v0.26) et vallée de la stabilité (v0.25) : résultats attendus et navigation vers le contenu.
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');const root=path.resolve(__dirname,'..');
const mime={'.js':'text/javascript','.css':'text/css','.json':'application/json','.ttf':'font/ttf','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{let rel=decodeURIComponent(req.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const file=path.join(root,rel);res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',mime[path.extname(file)]||'text/html');res.end(fs.readFileSync(file))}catch(e){res.statusCode=404;res.end()}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/`;const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||'chromium'});const errors=[];try{
 for(const [w,scheme] of [[390,'dark'],[1280,'light']]){
  const page=await browser.newPage({viewport:{width:w,height:860},colorScheme:scheme});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.waitForSelector('.element',{state:'attached'});
  const first=async q=>page.evaluate(q=>NucleaSearch.search(q).map(h=>h.group+':'+h.title),q);
  assert.match((await first('U-235'))[0],/^is:.*Uranium 235/);assert.match((await first('235U'))[0],/^is:/);assert.match((await first('cobalt 60'))[0],/^is:.*Cobalt 60/);
  assert.equal((await first('Fe'))[0],'el:Fer (Fe)');assert.equal((await first('92'))[0],'el:Uranium (U)');
  assert.ok((await first('période')).some(h=>h.startsWith('fo:λ = ln(2) / T½')));assert.ok((await first('becquerel')).some(h=>h.startsWith('fo:')));
  assert.ok((await first('cda')).some(h=>h==='fo:CDA = ln(2) / μ'));assert.ok((await first('vallée')).includes('vi:Vallée de la stabilité'));
  assert.ok((await first('aston')).some(h=>h.startsWith('to:')));assert.ok((await first('isotopes')).some(h=>h.startsWith('pa:')));assert.ok((await first('dose')).some(h=>h.startsWith('ex:')));
  assert.equal((await first('zzqx')).length,0);
  // Navigation : isotope, formule, phénomène, puis Retour.
  await page.click('#searchOpen');await page.fill('#searchAll','U-235');await page.keyboard.press('Enter');await page.waitForTimeout(700);
  assert.equal(await page.evaluate(()=>document.querySelector('#iso').selectedOptions[0].textContent),'U-235');assert.ok(await page.evaluate(()=>document.querySelector('#searchDialog').hidden));
  await page.keyboard.press('Escape');await page.waitForTimeout(300);
  await page.click('#searchOpen');await page.fill('#searchAll','CDA');await page.keyboard.press('Enter');await page.waitForTimeout(700);
  assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('#formulaList details.formula-item')].filter(d=>d.open).map(d=>d.querySelector('summary').textContent.trim())),['CDA = ln(2) / μ']);
  await page.click('#searchOpen');await page.fill('#searchAll','vallée');await page.keyboard.press('Enter');await page.waitForTimeout(1500);
  assert.equal(await page.evaluate(()=>document.querySelector('#visualViewer').hidden),false);
  const f=page.frames().find(x=>x.url().includes('vallee.html'));assert.ok(f,'vallée chargée');
  const n=await f.evaluate(()=>document.querySelectorAll('#cells rect').length);assert.equal(n,3383);
  await f.fill('#findIn','Co 60');await f.click('#findForm button');await page.waitForTimeout(200);
  assert.match(await f.textContent('#info'),/trop de neutrons/);
  await page.goBack();await page.waitForTimeout(400);assert.ok(await page.evaluate(()=>document.querySelector('#visualViewer').hidden));
  // Ouverture au clavier (/) et fermeture par Échap.
  await page.keyboard.press('/');await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>document.querySelector('#searchDialog').hidden),false);
  await page.keyboard.press('Escape');await page.waitForTimeout(150);assert.ok(await page.evaluate(()=>document.querySelector('#searchDialog').hidden));
  // Mini-jeu caché : « 235 » dans la loupe, puis trois appuis sur la case U de la fiche de l'uranium.
  assert.deepEqual(await first('235'),['se:Un neutron, et tout bascule…']);
  await page.click('#searchOpen');await page.fill('#searchAll','235');await page.keyboard.press('Enter');await page.waitForTimeout(1200);
  let g=page.frames().find(x=>x.url().includes('reaction.html'));assert.ok(g,'mini-jeu ouvert depuis la loupe');
  assert.equal(await g.evaluate(()=>document.querySelectorAll('#levels [data-l]').length),4);
  await g.click('#actBtn');const bb=await g.locator('#board').boundingBox();await page.mouse.click(bb.x+bb.width/2,bb.y+bb.height/3);await page.waitForTimeout(400);
  assert.equal(await g.evaluate(()=>window.__nucleaJeu.st.phase),'run');
  await page.goBack();await page.waitForTimeout(400);assert.ok(await page.evaluate(()=>document.querySelector('#visualViewer').hidden));
  await page.evaluate(()=>{document.querySelector('[data-tab="table"]').click();showElement(92,true)});await page.waitForTimeout(300);
  for(let i=0;i<3;i++)await page.click('#detailContent .detailhead .tile');await page.waitForTimeout(900);
  assert.equal(await page.evaluate(()=>document.querySelector('#visualViewer').hidden),false);assert.ok(page.frames().some(x=>x.url().includes('reaction.html')),'mini-jeu ouvert depuis la fiche de l’uranium');
  await page.goBack();await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth<=1),true);
  await page.close();console.log(`${w}px ${scheme} : recherche (isotopes, éléments, formules, outils, phénomènes, parcours, exercices), navigation, Retour, clavier, vallée de la stabilité et mini-jeu caché OK`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
