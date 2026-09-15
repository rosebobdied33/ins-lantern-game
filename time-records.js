(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TimeRecords=api;})(typeof window!=='undefined'?window:this,function(){
 const format=cs=>(cs/100).toFixed(2);
 const valid=r=>r&&typeof r.id==='string'&&typeof r.name==='string'&&typeof r.won==='boolean'&&Number.isInteger(r.elapsedCs)&&r.elapsedCs>=0&&r.elapsedCs<=6000&&Number.isFinite(r.date)&&Number.isFinite(r.score);
 const compare=(a,b)=>Number(b.won)-Number(a.won)||a.elapsedCs-b.elapsedCs||a.date-b.date;
 const completed=records=>records.filter(r=>valid(r)&&r.won).sort(compare);
 const rank=(records,result)=>result.won?1+completed(records).filter(r=>r.elapsedCs<result.elapsedCs).length:null;
 const elapsed=(now,start)=>Math.min(6000,Math.max(0,Math.round((now-start)/10)));
 return {format,valid,compare,completed,rank,elapsed};
});
