/* Nucléa TIIN v0.7 — parcours isotopique, sans simulation temporelle. */
(function(root){
  const deltas={"B-":[1,0],"B+":[-1,0],EC:[-1,0],"EC+B+":[-1,0],A:[-2,-4],N:[0,-1],P:[-1,-1],"2N":[0,-2],"2P":[-2,-2],"2B-":[2,0],"2B+":[-2,0],"2EC":[-2,0],"B-N":[1,-1],"B-2N":[1,-2],"B-A":[-1,-4],ECP:[-2,-1],"B+P":[-2,-1]};
  const csSource="https://www.nndc.bnl.gov/nudat3/getdecaydataset.jsp?dsid=137cs+bM+decay&nucleus=137BA";
  function key(z,v){return `${z}:${v.label||v.a}`}
  function branches(z,v){
    if(z===55&&v.a===137&&!v.label){
      return [
        {mode:"B-",percent:"94.7",unc:"2",target:{z:56,a:137,label:"137m"},source:csSource,note:"Branche vers le niveau métastable à 661,659 keV."},
        {mode:"B-",percent:"5.3",unc:"2",target:{z:56,a:137},source:csSource,note:"Branche directe vers le niveau fondamental."},
        {mode:"B-",percent:"0.00058",unc:"8",target:{z:56,a:137},source:csSource,note:"Niveau à 283,50 keV puis désexcitation rapide, non dessinée."}
      ];
    }
    return (v.decays||[]).map(d=>({...d}));
  }
  function defaultBranch(bs){
    // Only compare unqualified numerical probabilities; otherwise retain source order.
    if(!bs.length||bs.some(b=>!/^\d+(\.\d*)?([eE][+-]?\d+)?$/.test(b.percent||"")))return 0;
    return bs.reduce((best,b,i)=>Number(b.percent)>Number(bs[best].percent)?i:best,0);
  }
  function trace(data,z,start,choices={},maxSteps=64){
    const nodes=[],seen=new Set();let v=start;
    for(let step=0;step<maxSteps;step++){
      const id=key(z,v);
      if(seen.has(id))return {nodes,status:"cycle",message:"Boucle détectée : le parcours s’arrête sans conclure à la stabilité."};
      seen.add(id);
      const node={z,v,id,branches:branches(z,v)};nodes.push(node);
      if(v.stable===true)return {nodes,status:"stable",message:"Premier noyau stable atteint sur la branche choisie."};
      if(!node.branches.length)return {nodes,status:"missing",message:"Aucun mode renseigné pour poursuivre. La stabilité n’est pas établie."};
      const chosen=choices[id];node.choice=Number.isInteger(chosen)&&chosen>=0&&chosen<node.branches.length?chosen:defaultBranch(node.branches);
      const branch=node.branches[node.choice];let target;
      if(branch.target)target=branch.target;
      else if(branch.mode==="SF"||branch.mode==="ECSF")return {nodes,status:"fission",message:"Fission : plusieurs fragments sont possibles. Aucun noyau fils unique n’est imposé."};
      else if(branch.mode==="IT"){
        if(!v.label)return {nodes,status:"unresolved",message:"Le niveau inférieur de cette transition n’est pas identifié dans les données embarquées."};
        target={z,a:v.a};
      }else if(deltas[branch.mode]){
        const [dz,da]=deltas[branch.mode];target={z:z+dz,a:v.a+da};
        node.projected=true;
      }else return {nodes,status:"unsupported",message:`Mode ${branch.mode} : filiation non prise en charge. Parcours interrompu.`};
      const next=(data[target.z]||[]).find(x=>x.a===target.a&&(target.label?x.label===target.label:!x.label));
      node.target=target;
      if(!next)return {nodes,status:"missing",message:`Le noyau fils (Z = ${target.z}, A = ${target.a}) manque dans les données embarquées. Parcours interrompu.`};
      z=target.z;v=next;
    }
    return {nodes,status:"limit",message:`Limite de ${maxSteps} noyaux atteinte : parcours interrompu sans conclure à la stabilité.`};
  }
  const api={trace,branches,defaultBranch,key};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  else root.DecayChain=api;
})(globalThis);
