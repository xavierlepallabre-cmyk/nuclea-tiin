// Cohérence des numéros de version : pied de page, package.json et cache hors connexion.
// Sans changement du nom de cache, les téléphones ne voient jamais la nouvelle version.
const fs=require('fs'),path=require('path'),assert=require('assert'),root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const footer=read('index.html').match(/Nucléa TIIN · v(\d+)\.(\d+)/),pkg=JSON.parse(read('package.json')).version.split('.'),cache=read('sw.js').match(/const CACHE='nuclea-tiin-v(\d+)'/);
assert(footer&&cache,'version ou cache introuvable');
assert.equal(`${footer[1]}.${footer[2]}`,`${pkg[0]}.${pkg[1]}`,'pied de page ≠ package.json');
assert.equal(cache[1],`${footer[1]}${footer[2].padStart(2,'0')}`,'nom du cache ≠ version : changer CACHE dans sw.js à chaque publication');
console.log(`Version v${footer[1]}.${footer[2]} cohérente avec le cache nuclea-tiin-v${cache[1]} : OK`);
