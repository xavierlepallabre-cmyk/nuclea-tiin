// v0.17 : parcours élève complet dans un navigateur (390 px et 1 280 px, clair et sombre).
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const root=path.resolve(__dirname,'..'),artifacts=path.join(root,'test-results');fs.mkdirSync(artifacts,{recursive:true});
const mime={'.js':'text/javascript','.css':'text/css','.json':'application/json','.ttf':'font/ttf','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.html':'text/html'};
const server=http.createServer((req,res)=>{const rel=decodeURIComponent(req.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const f=path.join(root,rel);res.setHeader('Content-Type',mime[path.extname(f)]||'text/html');res.end(fs.readFileSync(f))}catch{res.statusCode=404;res.end()}});
const visible=page=>page.evaluate(()=>document.querySelector('main > section.panel:not(.hidden)').id);
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||'chromium'});
 try{for(const [width,scheme] of [[390,'light'],[1280,'dark']]){
  const ctx=await browser.newContext({viewport:{width,height:900},colorScheme:scheme,hasTouch:width<700,reducedMotion:'reduce'}),page=await ctx.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(url);await page.waitForSelector('.pc-step');
  // Accueil : un nouvel élève arrive sur le parcours, avec les deux choix.
  assert.equal(await visible(page),'parcours');assert(await page.locator('#pcContinue').isVisible()&&await page.locator('#pcFree').isVisible());
  assert.equal(await page.locator('.pc-step').count(),6);assert.equal(await page.locator('.pc-chip-todo').count(),6);
  await page.screenshot({path:path.join(artifacts,`parcours-accueil-${width}.png`),fullPage:true});
  const data=await page.evaluate(()=>NucleaParcoursData.get('decouverte'));
  await page.locator('#pcContinue').click();
  for(const [si,step] of data.steps.entries()){
   if(si>0){assert(await page.locator('#pcNextStep').isVisible());await page.locator('#pcNextStep').click()}
   assert.equal((await page.locator('.pc-title').innerText()).split('\n')[0].trim(),step.title);
   for(const [pi,[pk]] of [['decouvrir'],['observer'],['manipuler'],['comprendre'],['verifier']].entries()){
    assert.equal(await page.locator('.pc-phases [aria-current="step"]').getAttribute('data-phase'),String(pi));
    const blocks=step.phases[pk];
    for(const [bi,b] of blocks.entries()){
     const id=`${step.id}-${pk}-${bi}`,el=page.locator(`[data-block="${id}"]`);
     if(b.action){
      await el.locator('.pc-tool').click();await page.waitForTimeout(150);
      const a=b.action;
      if(a.tool==='visual'){assert(await page.locator('#visualViewer').isVisible());await page.waitForFunction(id=>document.querySelector('#visualFrame').contentWindow.location.href.includes('visuels/'+id),a.id);await page.locator('#closeVisual').click();await page.waitForTimeout(100)}
      else if(a.tool==='element'){assert(await page.locator('#detail').isVisible());const sel=await page.evaluate(()=>document.querySelector('#iso').selectedOptions[0].textContent);assert(sel.includes('-'+a.iso),sel);if(a.chain)assert(await page.locator('#decayPanel').isVisible())}
      else if(a.tool==='decay'){assert.equal(await visible(page),'formulas');assert((await page.locator('#rdAnswer').innerText()).replace(/\s/g,'').startsWith('200'),await page.locator('#rdAnswer').innerText())}
      else if(a.tool==='energy'){assert.equal(await visible(page),'explore');assert.equal(await page.locator('#energyIsotope').inputValue(),'Fe-56')}
      else if(a.tool==='exercise'){assert.equal(await visible(page),'exercises');assert.equal(await page.locator(`#exerciseTheme [data-value="${a.theme}"]`).getAttribute('aria-checked'),'true')}
      else if(a.tool==='date'){assert.equal(await visible(page),'explore');assert(await page.locator('#dateMission').isVisible())}
      else if(a.tool==='formulas'){assert.equal(await visible(page),'formulas');assert(await page.locator(`#formulaList > details[data-topic="${a.topic}"]`).evaluate(d=>d.open))}
      else if(a.tool==='table')assert.equal(await visible(page),'table');
      assert(await page.locator('#pcReturn').isVisible(),'bandeau de retour');
      await page.locator('#pcReturn .pc-return-go').click();await page.waitForTimeout(200);
      assert.equal(await visible(page),'parcours');assert(await page.locator('#detail').isHidden());
      assert.equal(await page.locator('.pc-phases [aria-current="step"]').getAttribute('data-phase'),String(pi),'retour à la même phase');
     }
     if(b.type==='read'){const wrong=String(b.answer.value+1000);await el.locator('input').fill(wrong);await el.locator('button[type=submit]').click();assert((await el.locator('.pc-feedback').innerText()).startsWith('Pas encore'));
      await el.locator('input').fill(String(b.answer.value).replace('.',','));await el.locator('button[type=submit]').click();assert((await el.locator('.pc-feedback').innerText()).startsWith('Correct'),b.id)}
     if(b.type==='choice'){const w=(b.correct+1)%b.options.length;await el.locator(`[data-opt="${w}"]`).click();assert((await el.locator('.pc-feedback').innerText()).startsWith('Pas encore'));await el.locator(`[data-opt="${b.correct}"]`).click();assert((await el.locator('.pc-feedback').innerText()).startsWith('Correct'),b.id)}
    }
    if(si===3&&pi===2)await page.screenshot({path:path.join(artifacts,`parcours-etape-${width}.png`),fullPage:true});
    if(pi<4)await page.locator(`.pc-nav [data-go="${pi+1}"]`).click();else await page.locator('#pcFinish').click();
   }
   // Reprise après fermeture : recharger au milieu de l'étape 2.
   if(si===1){await page.reload();await page.waitForSelector('.pc-step');assert.equal(await visible(page),'parcours');assert((await page.locator('#pcHeroTitle').innerText()).includes('Étape 3'));assert.equal(await page.locator('.pc-chip-done').count(),2);await page.locator('#pcContinue').click();await page.locator('.pc-phases [data-phase="4"]').click();assert(await page.locator('#pcNextStep').count()===0);await page.locator('#pcBack').click();await page.locator('[data-step="isotopes"]').click();await page.locator('.pc-phases [data-phase="4"]').click()}
  }
  await page.locator('#pcHome').click();assert((await page.locator('.pc-count').innerText()).startsWith('6 étapes terminées'));
  // Une réponse déjà trouvée reste affichée en revenant dans l'étape.
  await page.locator('[data-step="decroissance"]').click();await page.locator('.pc-phases [data-phase="2"]').click();assert(await page.locator('[data-task="d-calc"] input').evaluate(i=>i.readOnly));
  // Explorer librement : mémorisé, l'application rouvre ensuite sur le tableau.
  await page.locator('#pcBack').click();await page.locator('#pcFree').click();assert.equal(await visible(page),'table');await page.reload();await page.waitForSelector('.element');assert.equal(await visible(page),'table');
  // Réinitialisation après confirmation.
  await page.locator('nav [data-tab="parcours"]').click();await page.locator('#pcReset').click();assert(await page.locator('#pcConfirm').isVisible());await page.locator('#pcResetNo').click();assert.equal(await page.locator('.pc-chip-done').count(),6);
  await page.locator('#pcReset').click();await page.locator('#pcResetYes').click();assert.equal(await page.locator('.pc-chip-done').count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width,'pas de défilement horizontal');
  assert.deepEqual(errors,[]);await ctx.close();
  console.log(`${width}px ${scheme} : 6 étapes parcourues, outils ouverts et retour à l'étape, réponses, reprise après rechargement, mode libre et réinitialisation OK`);
 }}finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
