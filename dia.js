const $=s=>document.querySelector(s),pad=n=>String(n).padStart(2,'0'),ROWS=25,KEY='sf2-attendance-v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()),today=()=>ymd(new Date());
const hms=d=>pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
const t12=t=>{const[h,m,s]=t.split(':').map(Number);return(h%12||12)+':'+pad(m)+':'+pad(s)+' '+(h<12?'AM':'PM')};
const sy=()=>{const n=new Date(),y=n.getFullYear();return n.getMonth()>=5?y+'-'+(y+1):(y-1)+'-'+y};
let S={school:{id:'',name:'',year:sy(),late:'6:10',head:''},sections:[],students:[],logs:{},noClass:[]};
try{const r=localStorage.getItem(KEY);if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
S.sections.forEach(c=>{if(['BRIXTON','EMPIRE','MONTCLAIR','ORION','STRATOS','VALORIAN','WELLINGTON'].includes(c.name.toUpperCase()))c.grade='12'});
save();

function loadClassData(){
 const sections=[
  ['12','BRIXTON','Wilson Sanchez'],
  ['12','EMPIRE','Mrs. Lorraine Balando Azada'],
  ['12','MONTCLAIR','Ms. Jullie Ann San Pablo'],
  ['12','ORION','Ma Creselle Olita'],
  ['12','STRATOS','Mrs. Mervic M. Mandap'],
  ['12','VALORIAN','Mr. Mark G. Sarcon'],
  ['12','WELLINGTON','Mr. Edwin Macaspag']
 ];
 const data=[
  ['BRIXTON','Begornia','Carl','Matthew','114261130032','M'],
  ['BRIXTON','Concepcion','James','Jeffry O.','13652610425','M'],
  ['BRIXTON','Sia','Alexandra','Mae R.','406463150079','F'],
  ['BRIXTON','Sabas','Chloe','Jane B.','136528141338','F'],
  ['EMPIRE','Boneza','Arman','Anthony','136528141316','M'],
  ['EMPIRE','Galgana','Charlotte','M.','136525140044','F'],
  ['EMPIRE','Latosa','Vanessa','Rain V.','136528140941','F'],
  ['EMPIRE','Togonon','Mitch','Zyrelle C.','107006140207','F'],
  ['MONTCLAIR','Berja','Argie','B.','112806140015','M'],
  ['MONTCLAIR','Talingting','Mark','Bryant','136653130329','M'],
  ['MONTCLAIR','Agustin','Rica','Marie G.','136524141135','F'],
  ['MONTCLAIR','Bachiller','Sophia','Mariz M.','136523150008','F'],
  ['MONTCLAIR','Co','Angelou','Nichole','136525140447','F'],
  ['MONTCLAIR','Jabagat','Kristel','G.','117847140206','F'],
  ['MONTCLAIR','Pelares','Stella','Marie F.','222501140195','F'],
  ['ORION','Avila','Allen','M.','482540150433','M'],
  ['ORION','Cambangay','Jeramel','I. T.','482724150018','M'],
  ['ORION','Sia','Franz','Codie A.','406459150088','M'],
  ['ORION','Daan','Wendy','Grace S.','136525140141','F'],
  ['ORION','Roldan','Samantha','Nicole M.','136524140780','F'],
  ['ORION','Sarondo','Soffia','Marie C.','482835150051','F'],
  ['STRATOS','De Asis','Melton','Jeg B.','122902140013','M'],
  ['STRATOS','De Vera','Rebec','Christian B.','114292150047','M'],
  ['STRATOS','Ramirez','Prince','Crian L.','136526140950','M'],
  ['STRATOS','Sagmit','Marc','Englebert Y.','134989140015','M'],
  ['STRATOS','Del Castillo','Bianca','Gabrielle O.','136525140041','F'],
  ['STRATOS','Durano','Frea','V.','136525140157','F'],
  ['VALORIAN','Dorado','Jaiden','Zhyrem F.','136533140329','M'],
  ['VALORIAN','Pambid','Mark','Athony S.','136523130035','M'],
  ['VALORIAN','Rosales','Sean','Zackerie A.','136524140443','M'],
  ['VALORIAN','Dela Cruz','Shanine','','136524140597','F'],
  ['VALORIAN','Salvador','Rona','','136515140335','F'],
  ['WELLINGTON','Cabusao','Dustine','Wayne B.','136524140597','M'],
  ['WELLINGTON','Darlucio','Raikkonen','B.','136525140182','M'],
  ['WELLINGTON','De Quiroz','Mike','Cedric B.','136490140098','M'],
  ['WELLINGTON','Garcia','Aldrin','Jay B.','136523140421','M'],
  ['WELLINGTON','Tarusan','Adrienne','Kathrice T.','136528131560','F']
 ];
 sections.forEach(([grade,name,adviser])=>{
  if(!S.sections.some(c=>c.name.toUpperCase()===name.toUpperCase())){
   S.sections.push({id:'s'+name.toLowerCase(),grade,name,adviser});
  }
 });
 data.forEach(([section,last,first,middle,id,sex])=>{
  const sec=S.sections.find(c=>c.name.toUpperCase()===section);
  if(sec&&!S.students.some(s=>s.secId===sec.id&&s.id===id&&s.last.toUpperCase()===last.toUpperCase())){
   S.students.push({id,last,first,middle,sex,secId:sec.id,remarks:''});
  }
 });
 S.sections.sort((a,b)=>a.name.localeCompare(b.name));
 save();
}

if(!S.sections.length&&!S.students.length)loadClassData();
const fullName=s=>s.last+', '+s.first+(s.middle?' '+s.middle:'');
const secName=id=>{const c=S.sections.find(x=>x.id===id);return c?'Grade '+c.grade+' - '+c.name:'-'};
const timeSeconds=t=>{
 const p=String(t||'').trim().split(':').map(Number);
 if(p.length<2||p.some(n=>!Number.isFinite(n)))return 0;
 return p[0]*3600+(p[1]*60)+(p[2]||0);
};
const isLate=t=>timeSeconds(t)>timeSeconds(S.school.late||'06:10');
let tab='scan',curMonth=today().slice(0,7),logDate=today();

/* tabs */
function show(){
 const t=[['scan','Scan'],['setup','Setup'],...S.sections.map(c=>[c.id,'Gr '+c.grade+' - '+c.name])];
 $('#tabs').innerHTML=t.map(([k,l])=>`<button data-t="${esc(k)}" class="${k===tab?'on':''}">${esc(l)}</button>`).join('');
 $('#p-scan').hidden=tab!=='scan';$('#p-setup').hidden=tab!=='setup';$('#p-sec').hidden=tab==='scan'||tab==='setup';
 if(tab==='scan')renderToday();else if(tab==='setup')renderSetup();else renderSection();
}
$('#tabs').onclick=e=>{const b=e.target.closest('button');if(b){tab=b.dataset.t;show()}};

/* scanning */
let last='',lastT=0,qr=null,cameraFacing='environment';
function record(code){
 code=String(code).trim();if(!code)return;
 const st=S.students.find(x=>x.id===code),box=$('#result');
 if(!st){box.className='result bad';box.innerHTML=`<b>Not found</b><br>No student has the code ${esc(code)}. Check the Setup tab.`;return}
 const d=today(),day=S.logs[d]||(S.logs[d]={});let t=day[st.id];const dup=!!t;
 if(!t){t=hms(new Date());day[st.id]=t;save()}
 const late=isLate(t);
 box.className='result '+(dup||late?'warn':'ok');
 box.innerHTML=`<div class="big">${esc(fullName(st))}</div><div>LRN: ${esc(st.id)}</div><div>${esc(secName(st.secId))} (${st.sex==='M'?'Male':'Female'})</div><div class="time">${t12(t)}</div><div>${dup?'Already recorded today':late?'Late':'On time'}</div>`;
 renderToday();
}
$('#camBtn').onclick=async()=>{
 const b=$('#camBtn');
 if(qr){try{await qr.stop();qr.clear()}catch(e){}qr=null;b.textContent='Start camera';return}
 if(!window.Html5Qrcode){alert('The scanner did not load. Check the internet, or use the LRN box.');return}
 qr=new Html5Qrcode('reader');
 try{
  await qr.start({facingMode:cameraFacing},{fps:10,qrbox:{width:230,height:230}},txt=>{
   const n=Date.now();if(txt===last&&n-lastT<3000)return;last=txt;lastT=n;record(txt)
  });
  b.textContent='Stop camera';
  $('#flipCam').hidden=false;
 }catch(e){
  qr=null;
  $('#reader').innerHTML='<div class="camera-placeholder">Camera preview unavailable</div>';
  alert('The camera could not start. Allow camera access in the browser, or use the LRN box.')
 }
};
$('#flipCam').onclick=async()=>{
 if(!qr)return;
 cameraFacing=cameraFacing==='environment'?'user':'environment';
 try{await qr.stop();await qr.start({facingMode:cameraFacing},{fps:10,qrbox:{width:230,height:230}},txt=>{
  const n=Date.now();if(txt===last&&n-lastT<3000)return;last=txt;lastT=n;record(txt)
 })}catch(e){alert('Could not switch cameras.')}
};
const man=()=>{record($('#manual').value);$('#manual').value='';$('#manual').focus()};
$('#manBtn').onclick=man;$('#manual').onkeydown=e=>{if(e.key==='Enter')man()};
function renderToday(){
 const day=S.logs[today()]||{};
 const rows=Object.entries(day).sort((a,b)=>b[1].localeCompare(a[1])).map(([id,t])=>{const s=S.students.find(x=>x.id===id);if(!s)return'';const l=isLate(t);
  return`<tr><td>${t12(t)}</td><td>${esc(fullName(s))}</td><td>${esc(secName(s.secId))}</td><td class="${l?'late':'okc'}">${l?'Late':'On time'}</td></tr>`}).join('');
 $('#todayCount').textContent='('+Object.keys(day).length+' of '+S.students.length+')';
 $('#todayTbl').innerHTML='<tr><th>Time</th><th>Name</th><th>Section</th><th>Status</th></tr>'+(rows||'<tr><td colspan="4">No arrivals yet today.</td></tr>');
}

/* setup */
const sf={sID:'id',sName:'name',sYear:'year',sHead:'head',sLate:'late'};
for(const[k,f]of Object.entries(sf))$('#'+k).oninput=e=>{S.school[f]=e.target.value;save()};
function renderSetup(){
 for(const[k,f]of Object.entries(sf))$('#'+k).value=S.school[f]||'';
 const opts=S.sections.map(c=>`<option value="${c.id}">${esc(secName(c.id))}</option>`).join('');
 $('#stSec').innerHTML=opts;$('#qrSec').innerHTML='<option value="">All sections</option>'+opts;
 $('#cList').innerHTML=S.sections.map(c=>`<div class="chip"><span>${esc(secName(c.id))} | Adviser: ${esc(c.adviser||'-')}</span><button data-dc="${c.id}">Remove</button></div>`).join('');
 const sexOrder=s=>s.sex==='M'?0:1;
 const list=[...S.students].sort((a,b)=>S.sections.findIndex(c=>c.id===a.secId)-S.sections.findIndex(c=>c.id===b.secId)||sexOrder(a)-sexOrder(b)||fullName(a).localeCompare(fullName(b)));
 $('#stCount').textContent='('+list.length+')';
 $('#stTbl').innerHTML='<tr><th>Name</th><th>LRN</th><th>Sex</th><th>Section</th><th></th></tr>'+list.map(s=>`<tr><td>${esc(fullName(s))}</td><td>${esc(s.id)}</td><td>${s.sex}</td><td>${esc(secName(s.secId))}</td><td><button data-ds="${esc(s.id)}">Remove</button></td></tr>`).join('');
}
$('#cAdd').onclick=()=>{
 const g=$('#cGrade').value.trim(),n=$('#cName').value.trim();
 if(!g||!n)return alert('Enter the grade level and the section name.');
 S.sections.push({id:'s'+Date.now().toString(36),grade:g,name:n,adviser:$('#cAdv').value.trim()});
 ['cGrade','cName','cAdv'].forEach(i=>$('#'+i).value='');save();show();
};
$('#cList').onclick=e=>{const b=e.target.closest('[data-dc]');if(!b)return;
 if(S.students.some(s=>s.secId===b.dataset.dc))return alert('Remove the students of this section first.');
 S.sections=S.sections.filter(c=>c.id!==b.dataset.dc);save();show()};
$('#stAdd').onclick=()=>{
 const id=$('#stLrn').value.trim(),last=$('#stLast').value.trim(),first=$('#stFirst').value.trim(),secId=$('#stSec').value;
 if(!id||!last||!first||!secId)return alert('Enter the LRN, last name, first name, and section. Add a section first if the list is empty.');
 if(S.students.some(s=>s.id===id))return alert('That LRN is already in the list.');
 S.students.push({id,last,first,middle:$('#stMid').value.trim(),sex:$('#stSex').value,secId,remarks:''});
 ['stLrn','stLast','stFirst','stMid'].forEach(i=>$('#'+i).value='');save();renderSetup();$('#stLrn').focus();
};
$('#stTbl').onclick=e=>{const b=e.target.closest('[data-ds]');if(!b||!confirm('Remove this student?'))return;
 S.students=S.students.filter(s=>s.id!==b.dataset.ds);save();renderSetup()};
$('#sample').onclick=()=>{
 if(!confirm('Load the Wellington, Stratos, Valorian, Orion, Empire, Brixton, and Montclair class lists?'))return;
 loadClassData();show();
};
function doPrint(m){document.body.className=m;setTimeout(()=>window.print(),500)}
window.onafterprint=()=>{document.body.className=''};
$('#qrPrint').onclick=()=>{
 if(!window.QRCode)return alert('The QR library did not load. Check the internet connection.');
 const id=$('#qrSec').value,list=S.students.filter(s=>!id||s.secId===id);
 if(!list.length)return alert('There are no students to print.');
 const sh=$('#qrSheet');sh.innerHTML='';
 list.forEach(s=>{const c=document.createElement('div'),q=document.createElement('div');c.className='qcard';c.append(q);
  new QRCode(q,{text:s.id,width:130,height:130,correctLevel:QRCode.CorrectLevel.M});
  c.insertAdjacentHTML('beforeend',`<b>${esc(fullName(s))}</b><span>${esc(secName(s.secId))}</span><span>LRN ${esc(s.id)}</span>`);sh.append(c)});
 doPrint('pm-qr');
};

/* School Form 2 */
function monthDays(m){
 const[y,mo]=m.split('-').map(Number),n=new Date(y,mo,0).getDate(),out=[];let base=null;
 for(let d=1;d<=n;d++){const dt=new Date(y,mo-1,d),w=dt.getDay();if(w===0||w===6)continue;
  const mon=new Date(y,mo-1,d-(w-1));if(!base)base=mon;
  out.push({d,date:ymd(dt),col:Math.round((mon-base)/604800000)*5+(w-1)})}
 return out;
}
function renderSection(){
 const sec=S.sections.find(c=>c.id===tab);if(!sec){tab='setup';return show()}
 const td=today(),days=monthDays(curMonth),byCol={};days.forEach(x=>byCol[x.col]=x);
 const off=x=>S.noClass.includes(x.date),isCls=x=>x&&x.date<=td&&!off(x),cls=days.filter(isCls);
 const logOf=(s,x)=>(S.logs[x.date]||{})[s.id];
 const mark=(s,x)=>{const t=logOf(s,x);return t?(isLate(t)?'L':'P'):'A'};
 const cell=(s,c)=>{const x=byCol[c];if(!x)return'<td class="dx off"></td>';
  if(off(x))return'<td class="dx off"></td>';if(x.date>td)return'<td class="dx"></td>';
  const m=mark(s,x),t=logOf(s,x);return`<td class="dx${m==='L'?' late':''}" title="${t?t12(t):'No scan'}">${m==='A'?'x':''}</td>`};
 const all=S.students.filter(s=>s.secId===sec.id).sort((a,b)=>fullName(a).localeCompare(fullName(b)));
 const M=all.filter(s=>s.sex==='M'),F=all.filter(s=>s.sex==='F');
 const block=(list,label)=>{
  let h='',A=0,T=0;const pr=Array(25).fill(0);
  list.forEach(s=>{let a=0,t=0,cells='';
   for(let c=0;c<25;c++){const x=byCol[c];cells+=cell(s,c);if(isCls(x)){const m=mark(s,x);if(m==='A')a++;else{pr[c]++;if(m==='L')t++}}}
   A+=a;T+=t;
   h+=`<tr><td class="nm">${esc(fullName(s))}</td>${cells}<td>${a||''}</td><td>${t||''}</td><td class="rm" contenteditable data-rem="${esc(s.id)}">${esc(s.remarks||'')}</td></tr>`});
  for(let i=list.length;i<ROWS;i++)h+=`<tr><td class="nm"></td>${'<td class="dx"></td>'.repeat(25)}<td></td><td></td><td></td></tr>`;
  h+=`<tr class="tot"><td class="nm">${label} | TOTAL Per Day</td>${pr.map((n,c)=>`<td>${isCls(byCol[c])?n:''}</td>`).join('')}<td>${A||''}</td><td>${T||''}</td><td></td></tr>`;
  return{h,A,T,pr};
 };
 const bm=block(M,'MALE'),bf=block(F,'FEMALE');
 const comb=`<tr class="tot"><td class="nm">Combined TOTAL PER DAY</td>${bm.pr.map((n,c)=>`<td>${isCls(byCol[c])?n+bf.pr[c]:''}</td>`).join('')}<td>${bm.A+bf.A||''}</td><td>${bm.T+bf.T||''}</td><td></td></tr>`;
 let d1='',d2='';
 for(let c=0;c<25;c++){const x=byCol[c];
  d1+=x?`<th data-day="${x.date}" class="${off(x)?'off':''}" title="Click to mark or unmark no class">${x.d}</th>`:'<th></th>';
  d2+=`<th>${['M','T','W','TH','F'][c%5]}</th>`}
 const mName=new Date(curMonth+'-01T00:00').toLocaleString('en-US',{month:'long',year:'numeric'});
 const sc=S.school;
 /* summary numbers */
 const n=cls.length,rM=M.length,rF=F.length,eM=+sec.enrol?.M||0,eF=+sec.enrol?.F||0;
 const sp=b=>b.pr.reduce((p,v)=>p+v,0),adaM=n?sp(bm)/n:NaN,adaF=n?sp(bf)/n:NaN,adaT=n?(sp(bm)+sp(bf))/n:NaN;
 const pc=(a,b)=>b>0&&Number.isFinite(a)?(a/b*100).toFixed(2):'',f2=v=>Number.isFinite(v)?v.toFixed(2):'';
 const run5=s=>{let r=0;for(const x of cls){if(mark(s,x)==='A'){if(++r>=5)return true}else r=0}return false};
 const r5=l=>l.filter(run5).length;
 const row=(l,a,b,c)=>`<tr><td class="l">${l}</td><td>${a}</td><td>${b}</td><td>${c}</td></tr>`;
 const inp=k=>`<input type="number" min="0" data-en="${k}" value="${sec.enrol?.[k]??''}">`;
 const sum=row('Enrolment as of (1st Friday of June)',inp('M'),inp('F'),(eM+eF)||'')
  +row('Late Enrollment during the month (beyond cut-off)','','','')
  +row('Registered Learners as of end of the month',rM,rF,rM+rF)
  +row('Percentage of Enrolment as of end of the month',pc(rM,eM),pc(rF,eF),pc(rM+rF,eM+eF))
  +row('Average Daily Attendance',f2(adaM),f2(adaF),f2(adaT))
  +row('Percentage of Attendance for the month',pc(adaM,rM),pc(adaF,rF),pc(adaT,rM+rF))
  +row('Number of students absent for 5 consecutive days',r5(M),r5(F),r5(M)+r5(F))
  +row('Drop out','','','')+row('Transferred out','','','')+row('Transferred in','','','');
 const lrows=all.map(s=>{const t=(S.logs[logDate]||{})[s.id];
  return`<tr><td>${esc(fullName(s))}</td><td>${esc(secName(sec.id))}</td><td>${t?t12(t):''}</td><td>${t?(isLate(t)?'Late':'On time'):(logDate>td?'':'Absent')}</td></tr>`}).join('');
 $('#p-sec').innerHTML=`
 <div class="card noprint"><div class="form">
  <label>Month<input type="month" id="mon" value="${curMonth}"></label>
  <label>Arrival log date<input type="date" id="logDate" value="${logDate}"></label>
  <button class="pri" id="prt">Print School Form 2</button></div>
  <p class="hint">Click a date number on the form to mark it as no class (holiday). A blank cell is present, x is absent, and an upper half shaded cell is late (after ${esc(sc.late)}). Hover a cell to see the arrival time. Type in the Remarks column to edit it.</p></div>
 <div class="scroll"><div class="sheet">
  <div class="sheet-heading">
   <div class="sheet-title">
    <h3>School Form 2 (SF2) Daily Attendance Report of Learners</h3>
    <div class="sub">(This replaces Form 1, Form 2 &amp; STS Form 4 - Absenteeism and Dropout Profile)</div>
   </div>
  </div>
  <img class="sf2-logo" src="DepEdLogo.png" alt="Department of Education logo">
  <div class="fld"><div><b>School ID</b><span>${esc(sc.id)}</span></div><div><b>School Year</b><span>${esc(sc.year)}</span></div><div><b>Report for the Month of</b><span>${mName}</span></div>
   <div><b>Name of School</b><span>${esc(sc.name)}</span></div><div><b>Grade Level</b><span>${esc(sec.grade)}</span></div><div><b>Section</b><span>${esc(sec.name)}</span></div></div>
  <table class="sf2"><colgroup><col class="n">${'<col class="d">'.repeat(25)}<col class="t"><col class="t"><col class="r"></colgroup>
  <thead><tr><th rowspan="3">LEARNER’S NAME<br>(Last Name, First Name, Middle Name)</th><th colspan="25">(1st row for date)</th><th colspan="2">Total for the Month</th><th rowspan="3">REMARKS (If DROPPED OUT, state reason, please refer to legend number 2. If TRANSFERRED IN/OUT, write the name of School.)</th></tr>
  <tr>${d1}<th rowspan="2">ABSENT</th><th rowspan="2">TARDY</th></tr><tr>${d2}</tr></thead>
  <tbody>${bm.h}${bf.h}${comb}</tbody></table></div></div>
 <div class="scroll"><div class="sheet s2"><div class="pg2"><div>
  <p><b>GUIDELINES:</b></p>
  <p>1. The attendance shall be accomplished daily. Refer to the codes for checking learners’ attendance.</p>
  <p>2. Dates shall be written in the columns after Learner’s Name.</p>
  <p>3. To compute the following:</p>
  <p>&nbsp;&nbsp;a. Percentage of Enrolment = Registered Learners as of end of the month ÷ Enrolment as of 1st Friday of the school year × 100</p>
  <p>&nbsp;&nbsp;b. Average Daily Attendance = Total Daily Attendance ÷ Number of School Days in reporting month</p>
  <p>&nbsp;&nbsp;c. Percentage of Attendance for the month = Average Daily Attendance ÷ Registered Learners as of end of the month × 100</p>
  <p>4. Every end of the month, the class adviser will submit this form to the office of the principal for recording of the summary table into School Form 4. Once signed by the principal, this form should be returned to the adviser.</p>
  <p>5. The adviser will provide necessary interventions including but not limited to home visitation to learners who were absent for 5 consecutive days and/or are at risk of dropping out.</p>
  <p>6. Attendance performance of learners will be reflected in Form 137 and Form 138 every grading period.</p>
  <p>* Beginning of School Year cut-off report is every 1st Friday of the School Year.</p><br>
  <p><b>1. CODES FOR CHECKING LEARNERS’ ATTENDANCE:</b> Blank - Present; (x) - Absent; Tardy (half shaded: Upper for Late Comer, Lower for Cutting Classes)</p>
  <p><b>2. REASONS/CAUSES FOR DROPPING OUT:</b></p>
  <p>a. Domestic-Related Factors: a.1 Had to take care of siblings; a.2 Early marriage/pregnancy; a.3 Parents’ attitude toward schooling; a.4 Family problems</p>
  <p>b. Individual-Related Factors: b.1 Illness; b.2 Overage; b.3 Death; b.4 Drug Abuse; b.5 Poor academic performance; b.6 Lack of interest/Distractions; b.7 Hunger/Malnutrition</p>
  <p>c. School-Related Factors: c.1 Teacher Factor; c.2 Physical condition of classroom; c.3 Peer Influence</p>
  <p>d. Geographic/Environmental: d.1 Distance between home and school; d.2 Armed conflict (incl. Tribal wars &amp; clan feuds); d.3 Calamities/Disasters</p>
  <p>e. Financial-Related: e.1 Child labor, work</p><p>f. Others (Specify)</p></div>
  <div><p><b>Month:</b> ${mName} &nbsp;&nbsp; <b>No. of Days of Classes:</b> ${n}</p>
  <table class="sum"><tr><th class="l">Summary</th><th>M</th><th>F</th><th>TOTAL</th></tr>${sum}</table>
  <div class="sig"><p>I certify that this is a true and correct report.</p><b>${esc((sec.adviser||'').toUpperCase())}</b><div>(Signature of Teacher over Printed Name)</div>
   <p style="margin-top:14px">Attested by:</p><b>${esc((sc.head||'').toUpperCase())}</b><div>(Signature of School Head over Printed Name)</div>
   <p style="margin-top:14px">Reviewed by:</p><b></b><div>(Division Representative over Printed Name)</div></div></div></div></div></div>
 <div class="scroll"><div class="sheet logsheet"><h3>Time of Arrival</h3><div class="sub">${esc(secName(sec.id))} | Date: ${logDate} | Late if after ${esc(sc.late)}</div>
  <table class="lg"><tr><th>Learner’s Name</th><th>Section</th><th>Time of Arrival</th><th>Status</th></tr>${lrows}</table></div></div>`;
}
const P=$('#p-sec');
P.addEventListener('click',e=>{
 const h=e.target.closest('[data-day]');
 if(h){const d=h.dataset.day,i=S.noClass.indexOf(d);i<0?S.noClass.push(d):S.noClass.splice(i,1);save();return renderSection()}
 if(e.target.id==='prt')window.print();
});
P.addEventListener('change',e=>{
 const t=e.target;
 if(t.id==='mon'&&t.value){curMonth=t.value;renderSection()}
 else if(t.id==='logDate'&&t.value){logDate=t.value;renderSection()}
 else if(t.dataset.en){const sec=S.sections.find(c=>c.id===tab);sec.enrol=sec.enrol||{};sec.enrol[t.dataset.en]=t.value;save();renderSection()}
});
P.addEventListener('focusout',e=>{
 const id=e.target.dataset?.rem;if(!id)return;
 const s=S.students.find(x=>x.id===id);if(s){s.remarks=e.target.textContent.trim();save()}
});
show();