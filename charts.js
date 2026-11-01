/* Dashboard charts: plain SVG, no libraries, works offline */
const PAL=["#1f5fff","#22c7f2","#c13cf0","#3be0c8","#f0d41c","#f5a021","#e5484d"], AVC=["#e86a5a","#7a6ad8","#3b9bff","#2fb585","#d9923b","#c0508a"];
let dashClass="";
const avc=n=>AVC[[...n].reduce((a,c)=>a+c.charCodeAt(0),0)%AVC.length];
const ini=n=>n.split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
const noData=m=>`<div class="empty">${m}</div>`;
function stat(s){
  const rows=data.subjects.map(sub=>{const k=`${s.id}|${sub.id}`;return{sub,has:k in data.marks,m:data.marks[k]}}),done=rows.filter(r=>r.has);
  const t=done.reduce((a,r)=>a+r.m,0),mx=done.reduce((a,r)=>a+r.sub.max,0),complete=done.length===data.subjects.length&&data.subjects.length>0;
  const pct=mx?t/mx*100:null,pass=complete&&rows.every(r=>r.m>=r.sub.max*.33);
  return{s,rows,pct,complete,status:complete?(pass?"PASS":"FAIL"):"PENDING",grade:complete?grade(pct):"—"};
}
function donut(sl){const tot=sl.reduce((a,s)=>a+s.v,0),r=62,c=2*Math.PI*r;let o=0,a="";
  sl.forEach(s=>{const l=s.v/tot*c;a+=`<circle cx="80" cy="80" r="${r}" fill="none" stroke="${s.col}" stroke-width="22" stroke-dasharray="${l} ${c-l}" stroke-dashoffset="${-o}" transform="rotate(-90 80 80)"><title>${escapeHTML(s.l)}: ${s.v}</title></circle>`;o+=l});
  const b=[...sl].sort((x,y)=>y.v-x.v)[0];
  return`<svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="${r}" fill="none" stroke="#eef0f6" stroke-width="22"/>${a}<text x="80" y="82" text-anchor="middle" class="donut-n">${(b.v/tot*100).toFixed(1)}%</text><text x="80" y="98" text-anchor="middle" class="axis">${escapeHTML(b.l.slice(0,14))}</text></svg>`}
function ring(p,label,col){const r=40,c=2*Math.PI*r,l=Math.min(p,100)/100*c;
  return`<div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" fill="none" stroke="#eee9fb" stroke-width="7"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${l} ${c-l}" transform="rotate(-90 50 50)"/><text x="50" y="48" text-anchor="middle" class="rn">${p.toFixed(1)}%</text><text x="50" y="64" text-anchor="middle" class="rs">${escapeHTML(label.slice(0,12))}</text></svg></div>`}
function grouped(items){ // items:[{l,a,b,c}] counts for Pass / Average / Fail
  const W=520,H=250,L=34,B=34,T=12,iw=W-L-8,ih=H-T-B,mx=Math.max(1,...items.flatMap(i=>[i.a,i.b,i.c])),top=Math.ceil(mx/4)*4||4,bw=Math.min(24,iw/items.length/4);let g="";
  for(let i=0;i<=4;i++){const y=T+ih-ih*i/4;g+=`<line x1="${L}" x2="${W-8}" y1="${y}" y2="${y}" class="gridline"/><text x="${L-6}" y="${y+4}" class="axis" text-anchor="end">${(top*i/4).toFixed(0)}</text>`}
  items.forEach((it,i)=>{const cx=L+iw/items.length*(i+.5);[[it.a,"#4a14c7","Pass"],[it.b,"#3b9bff","Average"],[it.c,"#f5a021","Fail"]].forEach(([v,col,n],j)=>{const h=v/top*ih,x=cx+(j-1.5)*bw*1.05;g+=`<rect x="${x}" y="${T+ih-h}" width="${bw}" height="${Math.max(h,v?2:0)}" rx="2" fill="${col}"><title>${escapeHTML(it.l)} · ${n}: ${v}</title></rect>`});
    g+=`<text x="${cx}" y="${H-12}" class="axis" text-anchor="middle">${escapeHTML(it.l.slice(0,12))}</text>`});
  return`<div class="legend"><span><i style="background:#4a14c7"></i>Pass (60%+)</span><span><i style="background:#3b9bff"></i>Average (33–59%)</span><span><i style="background:#f5a021"></i>Fail (below 33%)</span></div><svg viewBox="0 0 ${W} ${H}">${g}</svg>`}
function pcard(label,x){return x?`<figure><div class="pc"><div class="av" style="background:${avc(x.s.name)}">${ini(x.s.name)}</div><div><big>${x.pct.toFixed(1)}%</big><b>${escapeHTML(x.s.name)}</b><small>Roll ${escapeHTML(x.s.roll)} · Grade ${x.grade}</small></div></div><figcaption>${label}</figcaption></figure>`:`<figure><div class="pc"><small>Not enough data</small></div><figcaption>${label}</figcaption></figure>`}

function renderAnalytics(){
  const box=$("dash");if(!box)return;
  const classes=[...new Set(data.students.map(s=>s.className))];
  if(!classes.includes(dashClass))dashClass="";
  const all=data.students.map(stat),list=all.filter(x=>!dashClass||x.s.className===dashClass),sc=list.filter(x=>x.pct!==null);
  const avg=sc.length?sc.reduce((a,x)=>a+x.pct,0)/sc.length:0,done=list.filter(x=>x.complete).length,pass=list.filter(x=>x.status==="PASS").length;
  const sel=`<select id="dashClass" aria-label="Class"><option value="">All classes</option>${classes.map(c=>`<option ${c===dashClass?"selected":""}>${escapeHTML(c)}</option>`).join("")}</select>`;
  const cnt=classes.map((c,i)=>({l:c,v:data.students.filter(s=>s.className===c).length,col:PAL[i%PAL.length]})),tot=data.students.length;
  const sorted=[...sc].sort((a,b)=>b.pct-a.pct);
  const exam=data.subjects.map(sub=>{const r={l:sub.name,a:0,b:0,c:0};list.forEach(x=>{const k=`${x.s.id}|${sub.id}`;if(!(k in data.marks))return;const p=data.marks[k]/sub.max*100;p>=60?r.a++:p>=33?r.b++:r.c++});return r});
  const rings=data.subjects.map((sub,i)=>{const v=list.map(x=>data.marks[`${x.s.id}|${sub.id}`]).filter(v=>v!==undefined);return v.length?ring(v.reduce((a,b)=>a+b,0)/v.length/sub.max*100,sub.name,["#4a14c7","#4a14c7","#3b9bff","#2fb585","#f5a021"][i%5]):""}).join("");
  box.innerHTML=`<div class="dash"><div class="col">
   <div class="top2"><div class="selwrap">${sel}<div class="muted small">Filter the dashboard by class</div></div>
    <div class="card kpi"><div class="ic">☺</div><div><strong>${list.length}</strong><span>Student Count</span></div></div>
    <div class="card kpi"><div class="ic">%</div><div><strong>${sc.length?avg.toFixed(1)+"%":"—"}</strong><span>Average Percentage</span></div></div></div>
   <div class="card strip"><span>Pass rate:<b>${done?Math.round(pass/done*100)+"%":"—"}</b></span><span>Results pending:<b class="o">${list.length-done}</b></span><span>Subjects:<b>${data.subjects.length}</b></span></div>
   <div class="card"><div class="card-head"><h3>Student Count</h3></div>${tot?`<div class="sc">${donut(cnt)}<div class="rows">${cnt.map(c=>`<div class="rowi"><i style="background:${c.col}"></i><span>${escapeHTML(c.l.slice(0,12))}</span><div class="tr"><span style="background:${c.col};width:${Math.max(c.v/tot*100,14)}%">${(c.v/tot*100).toFixed(1)}%</span></div><em>${c.v}</em></div>`).join("")}</div></div>`:noData("Add students to see the class split.")}</div>
   <div class="card"><div class="card-head"><h3>Examination Results</h3></div>${Object.keys(data.marks).length?grouped(exam):noData("Enter marks to see results by subject.")}</div>
  </div><div class="col">
   <div class="card"><div class="perf">${pcard("Class Topper",sorted[0])}${pcard("Runner-up",sorted[1])}${pcard("Third Place",sorted[2])}${pcard("Needs Support",sorted.length>3?sorted[sorted.length-1]:null)}</div></div>
   <div class="card"><div class="card-head"><h3>Student Details</h3></div>${list.length?`<div class="scroll">${list.map(x=>`<div class="sd"><div class="av" style="background:${avc(x.s.name)}">${ini(x.s.name)}</div><small>Roll ${escapeHTML(x.s.roll)}</small><b>${escapeHTML(x.s.name)}</b><div class="st"><div>${x.pct===null?"—":x.pct.toFixed(1)+"%"}<small>Marks</small></div><div>${x.grade}<small>Grade</small></div><div>${x.status.slice(0,4)}<small>Result</small></div></div></div>`).join("")}</div>`:noData("No students yet.")}</div>
   <div class="card"><div class="card-head"><h3>Average Score</h3></div>${rings?`<div class="rings">${rings}</div>`:noData("Subject averages appear once marks are saved.")}</div>
  </div></div>`;
  $("dashClass").onchange=e=>{dashClass=e.target.value;renderAnalytics()};
}
function renderStudentCharts(s){
  const box=$("studentCharts");if(!box)return;const x=stat(s),e=x.rows.filter(r=>r.has);
  box.innerHTML=`<h3>Your performance</h3>`+(e.length?`<div class="rings">${e.map((r,i)=>ring(r.m/r.sub.max*100,r.sub.name,["#4a14c7","#3b9bff","#2fb585","#f5a021"][i%4])).join("")}</div>`:noData("Your marks haven't been entered yet."));
}
const _renderAdmin=renderAdmin;renderAdmin=function(){_renderAdmin();renderAnalytics()};
const _renderStudent=renderStudent;renderStudent=function(s){_renderStudent(s);renderStudentCharts(s)};
const _show=show;show=function(id){_show(id);$("who").textContent=id==="adminView"?"Signed in as Admin":id==="studentView"?"Signed in as Student":""};
