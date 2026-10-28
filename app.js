/* EcoCampus demo application. Data is stored in this browser using localStorage. */
(function(){
'use strict';
const KEYS={users:'ecocampus_users',challenges:'ecocampus_challenges',session:'ecocampus_session',completions:'ecocampus_completions',proofs:'ecocampus_proofs'};
const seedChallenges=[
{id:'c1',title:'Bring a reusable bottle',description:'Skip single-use plastic bottles for a day and refill your own bottle instead.',points:20,category:'Waste'},
{id:'c2',title:'Sort your waste correctly',description:'Separate dry recyclables and wet waste in the correct campus bins.',points:25,category:'Waste'},
{id:'c3',title:'Walk or cycle to campus',description:'Choose a low-carbon commute for one journey, where safe and practical.',points:30,category:'Transport'},
{id:'c4',title:'Save electricity',description:'Switch off unused lights, fans and equipment in your classroom or study area.',points:15,category:'Energy'},
{id:'c5',title:'Refill, don’t waste water',description:'Use water thoughtfully and report a leaking tap if you spot one.',points:20,category:'Water'},
{id:'c6',title:'Join a campus clean-up',description:'Spend at least 15 minutes helping keep a shared campus space clean.',points:40,category:'Community'},
{id:'c7',title:'Go paper-light',description:'Use digital notes or print double-sided for your next study task.',points:20,category:'Energy'}
];
const badgeDefs=[
{id:'starter',icon:'🌱',name:'First Steps',desc:'Complete 1 challenge',test:n=>n>=1},
{id:'consistent',icon:'🌿',name:'Green Habit',desc:'Complete 3 challenges',test:n=>n>=3},
{id:'champion',icon:'🏆',name:'Eco Champion',desc:'Complete 5 challenges',test:n=>n>=5},
{id:'legend',icon:'🌍',name:'Planet Protector',desc:'Complete all 7 starter challenges',test:n=>n>=7},
{id:'points',icon:'⭐',name:'Point Collector',desc:'Earn 100 points',test:(n,p)=>p>=100}
];
const $=id=>document.getElementById(id);
const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v===null?fallback:v}catch(e){return fallback}};
const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
function init(){if(!localStorage.getItem(KEYS.users))write(KEYS.users,[{id:'admin',name:'EcoCampus Admin',email:'admin@ecocampus.com',password:'admin123',college:'EcoCampus Administration',role:'admin'}]);if(!localStorage.getItem(KEYS.challenges))write(KEYS.challenges,seedChallenges);if(!localStorage.getItem(KEYS.completions))write(KEYS.completions,{});if(!localStorage.getItem(KEYS.proofs))write(KEYS.proofs,[]);}
function users(){return read(KEYS.users,[])}function challenges(){return read(KEYS.challenges,seedChallenges)}function completions(){return read(KEYS.completions,{})}function session(){return read(KEYS.session,null)}
function currentUser(){const s=session();return s?users().find(u=>u.id===s.userId)||null:null}
function setMessage(id,msg,error=false){const el=$(id);if(el){el.textContent=msg;el.classList.toggle('error',error)}}
function toast(msg){const old=document.querySelector('.toast');if(old)old.remove();const el=document.createElement('div');el.className='toast';el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),2600)}
function go(url){window.location.href=url}
function requireUser(){const u=currentUser();if(!u){go('index.html');return null}if(u.role==='admin'&&!location.pathname.endsWith('admin-dashboard.html')){go('admin-dashboard.html');return null}if(u.role!=='admin'&&location.pathname.endsWith('admin-dashboard.html')){go('student-dashboard.html');return null}return u}
function logout(){localStorage.removeItem(KEYS.session);go('index.html')}window.logout=logout;
function proofs(){return read(KEYS.proofs,[])}
function userCompletions(id){return [...new Set(proofs().filter(p=>p.studentId===id&&p.status==='approved').map(p=>p.taskId))]}
function stats(u){const done=userCompletions(u.id),all=challenges();const points=done.reduce((sum,id)=>sum+(all.find(c=>c.id===id)?.points||0),0);return {done,points,badges:badgeDefs.filter(b=>b.test(done.length,points))}}
function studentUsers(){return users().filter(u=>u.role!=='admin')}
function ranking(){return studentUsers().map(u=>({u,s:stats(u)})).sort((a,b)=>b.s.points-a.s.points||b.s.done.length-a.s.done.length||a.u.name.localeCompare(b.u.name))}
function rankFor(id){const index=ranking().findIndex(x=>x.u.id===id);return index<0?'—':index+1}
function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function badgeHTML(b){return `<div class="badge-item"><span class="badge-icon">${b.icon}</span><b>${escapeHTML(b.name)}</b><small>${escapeHTML(b.desc)}</small></div>`}
function emptyBadges(){return '<div class="empty-state">No badges yet. Complete a challenge to earn your first badge.</div>'}
function challengeHTML(c,u,compact=false){
 const done=userCompletions(u.id).includes(c.id), own=proofs().filter(p=>p.studentId===u.id&&p.taskId===c.id).sort((a,b)=>b.submittedAt-a.submittedAt)[0];
 if(compact)return `<div class="mini-challenge"><div class="challenge-icon">${categoryIcon(c.category)}</div><div class="mini-info"><b>${escapeHTML(c.title)}</b><small>${escapeHTML(c.category)} · ${done?'Approved':own?escapeHTML(own.status[0].toUpperCase()+own.status.slice(1)):'Proof required'}</small></div><span class="points">+${c.points}</span></div>`;
 const status=done?'Approved':own?(own.status==='pending'?'Awaiting admin review':own.status==='rejected'?'Rejected — resubmit proof':'Approved'):'';
 return `<article class="challenge-card"><div class="card-top"><span class="challenge-icon">${categoryIcon(c.category)}</span><span class="category">${escapeHTML(c.category)}</span></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.description)}</p><div class="points">+${c.points} points after approval</div>${done?'<div class="proof-status approved">✓ Proof approved · challenge completed</div>':`<form class="proof-form" data-proof-form="${escapeHTML(c.id)}"><label for="proof-${escapeHTML(c.id)}">Upload photo proof</label><input id="proof-${escapeHTML(c.id)}" type="file" accept="image/*" required ${own&&own.status==='pending'?'disabled':''}><div class="proof-preview" id="preview-${escapeHTML(c.id)}">${own&&own.image?`<img src="${own.image}" alt="Previously submitted proof">`:''}</div><button class="btn" type="submit" ${own&&own.status==='pending'?'disabled':''}>${own&&own.status==='pending'?'Proof pending review':own&&own.status==='rejected'?'Resubmit proof':'Upload proof & submit'}</button>${own?`<p class="proof-status ${escapeHTML(own.status)}">Status: ${escapeHTML(own.status)}${own.reason?` · ${escapeHTML(own.reason)}`:''}</p>`:''}</form>`}</article>`;
}
function categoryIcon(c){return ({Waste:'♻️',Energy:'⚡',Transport:'🚲',Water:'💧',Community:'🤝'})[c]||'🌱'}
function loginInit(){const form=$('loginForm');if(!form)return;form.addEventListener('submit',e=>{e.preventDefault();const email=$('loginEmail').value.trim().toLowerCase(),password=$('loginPassword').value;const u=users().find(x=>x.email.toLowerCase()===email&&x.password===password);if(!u){setMessage('loginMessage','Email or password is incorrect.',true);return}write(KEYS.session,{userId:u.id});go(u.role==='admin'?'admin-dashboard.html':'student-dashboard.html')})}
function registerInit(){const form=$('registerForm');if(!form)return;form.addEventListener('submit',e=>{e.preventDefault();const name=$('regName').value.trim(),email=$('regEmail').value.trim().toLowerCase(),college=$('regCollege').value.trim(),password=$('regPassword').value;if(users().some(u=>u.email.toLowerCase()===email)){setMessage('registerMessage','An account with this email already exists.',true);return}const u={id:'u'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),name,email,college,password,role:'student'};write(KEYS.users,[...users(),u]);write(KEYS.session,{userId:u.id});go('student-dashboard.html')})}
function dashboardInit(){const u=requireUser();if(!u||u.role==='admin')return;const s=stats(u);$('welcomeName').textContent=u.name.split(' ')[0];$('dashPoints').textContent=s.points;$('dashCompleted').textContent=s.done.length;$('dashBadges').textContent=s.badges.length;$('dashRank').textContent='#'+rankFor(u.id);const list=$('dashboardChallenges');if(list){const items=challenges().filter(c=>!s.done.includes(c.id)).slice(0,3);list.innerHTML=items.length?items.map(c=>challengeHTML(c,u,true)).join(''):'<div class="empty-state">You completed every available challenge. Add more through the admin dashboard.</div>'}const b=$('dashboardBadges');if(b)b.innerHTML=s.badges.length?s.badges.map(badgeHTML).join(''):emptyBadges()}
function challengesInit(){const u=requireUser();if(!u||u.role==='admin')return;const search=$('challengeSearch'),filter=$('categoryFilter');function render(){const q=search.value.trim().toLowerCase(),cat=filter.value;const list=challenges().filter(c=>(cat==='All'||c.category===cat)&&(c.title+' '+c.description+' '+c.category).toLowerCase().includes(q));$('challengeGrid').innerHTML=list.map(c=>challengeHTML(c,u)).join('');$('emptyChallenges').classList.toggle('hidden',list.length>0);document.querySelectorAll('[data-proof-form]').forEach(form=>{const input=form.querySelector('input[type=file]'),preview=$('preview-'+form.dataset.proofForm);input.addEventListener('change',()=>{const file=input.files[0];if(!file)return;if(!file.type.startsWith('image/')){toast('Please choose an image file.');input.value='';return}if(file.size>1500000){toast('Please choose an image under 1.5 MB.');input.value='';return}const reader=new FileReader();reader.onload=()=>{preview.innerHTML=`<img src="${reader.result}" alt="Selected proof preview">`};reader.readAsDataURL(file)});form.addEventListener('submit',e=>{e.preventDefault();submitProof(form.dataset.proofForm,u,input.files[0])})})}search.addEventListener('input',render);filter.addEventListener('change',render);render()}
function submitProof(taskId,u,file){if(!file)return;const all=proofs();if(all.some(p=>p.studentId===u.id&&p.taskId===taskId&&p.status==='approved'))return;if(all.some(p=>p.studentId===u.id&&p.taskId===taskId&&p.status==='pending')){toast('Your proof is already awaiting review.');return}if(file.size>1500000){toast('Image must be under 1.5 MB.');return}const reader=new FileReader();reader.onload=()=>{const next=proofs();next.push({id:'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),studentId:u.id,taskId,image:reader.result,fileName:file.name,submittedAt:Date.now(),status:'pending',reason:''});write(KEYS.proofs,next);toast('Proof submitted for admin review.');challengesInit()};reader.readAsDataURL(file)}
function leaderboardMarkup(){const list=ranking();if(!list.length)return '<div class="empty-state">No student accounts yet. Register to appear on the leaderboard.</div>';return `<table><thead><tr><th>Rank</th><th>Student</th><th>College / department</th><th>Completed</th><th>Points</th></tr></thead><tbody>${list.map((x,i)=>`<tr><td class="rank">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</td><td><b>${escapeHTML(x.u.name)}</b></td><td>${escapeHTML(x.u.college||'—')}</td><td>${x.s.done.length}</td><td><b>${x.s.points}</b></td></tr>`).join('')}</tbody></table>`}
function leaderboardInit(){const u=requireUser();if(!u||u.role==='admin')return;const el=$('leaderboardTable');if(el)el.innerHTML=leaderboardMarkup()}
function profileInit(){const u=requireUser();if(!u||u.role==='admin')return;const s=stats(u);$('profileInitials').textContent=u.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();$('profileName').textContent=u.name;$('profileEmail').textContent=u.email;$('profileNameInput').value=u.name;$('profileCollegeInput').value=u.college||'';$('profilePoints').textContent=s.points;$('profileCompleted').textContent=s.done.length;$('profileRank').textContent='#'+rankFor(u.id);$('profileBadges').innerHTML=s.badges.length?s.badges.map(badgeHTML).join(''):emptyBadges();$('profileForm').addEventListener('submit',e=>{e.preventDefault();const list=users(),idx=list.findIndex(x=>x.id===u.id);list[idx].name=$('profileNameInput').value.trim();list[idx].college=$('profileCollegeInput').value.trim();write(KEYS.users,list);setMessage('profileMessage','Profile updated successfully.');profileInit()});$('deleteAccount').addEventListener('click',()=>{if(!confirm('Delete your account and all your earned points? This cannot be undone.'))return;write(KEYS.users,users().filter(x=>x.id!==u.id));const d=completions();delete d[u.id];write(KEYS.completions,d);localStorage.removeItem(KEYS.session);go('index.html')})}
function renderProofQueue(){const target=$('proofReviewList');if(!target)return;const list=proofs().slice().sort((a,b)=>b.submittedAt-a.submittedAt);target.innerHTML=list.length?list.map(p=>{const student=users().find(x=>x.id===p.studentId),task=challenges().find(x=>x.id===p.taskId);return `<article class="proof-review-card"><div class="proof-review-image"><img src="${p.image}" alt="Proof submitted by ${escapeHTML(student?.name||'student')}"></div><div class="proof-review-info"><div class="proof-review-top"><span class="category">${escapeHTML(p.status)}</span><small>${new Date(p.submittedAt).toLocaleString()}</small></div><h3>${escapeHTML(task?.title||'Deleted challenge')}</h3><p><b>${escapeHTML(student?.name||'Unknown student')}</b> · ${escapeHTML(student?.email||'')}</p><p class="muted">Task ID: ${escapeHTML(p.taskId)} · Student ID: ${escapeHTML(p.studentId)}</p>${p.reason?`<p class="proof-status rejected">Reason: ${escapeHTML(p.reason)}</p>`:''}${p.status==='pending'?`<div class="admin-actions"><button class="btn btn-small" data-proof-approve="${p.id}">Approve</button><button class="btn btn-danger btn-small" data-proof-reject="${p.id}">Reject</button></div>`:''}</div></article>`}).join(''):'<div class="empty-state">No proof submissions yet. Submitted photos will appear here for review.</div>';target.querySelectorAll('[data-proof-approve]').forEach(b=>b.addEventListener('click',()=>reviewProof(b.dataset.proofApprove,'approved')));target.querySelectorAll('[data-proof-reject]').forEach(b=>b.addEventListener('click',()=>{const reason=prompt('Reason for rejection (the student can resubmit):','Please upload a clearer photo showing the completed task.');if(reason===null)return;reviewProof(b.dataset.proofReject,'rejected',reason.trim()||'Proof needs revision.')}))}
function reviewProof(id,status,reason=''){const list=proofs(),p=list.find(x=>x.id===id);if(!p||p.status!=='pending')return;p.status=status;p.reason=reason;p.reviewedAt=Date.now();write(KEYS.proofs,list);toast(status==='approved'?'Proof approved. Points and completion updated.':'Proof rejected. Student may resubmit.');adminInit()}
function adminInit(){const u=requireUser();if(!u||u.role!=='admin')return;function render(){const list=challenges(),r=ranking(),d=completions();$('adminStudents').textContent=studentUsers().length;$('adminChallenges').textContent=list.length;$('adminCompletions').textContent=proofs().filter(p=>p.status==='approved').length;$('adminPoints').textContent=r.reduce((n,x)=>n+x.s.points,0);$('adminLeaderboard').innerHTML=leaderboardMarkup();renderProofQueue();$('adminChallengeList').innerHTML=list.length?list.map(c=>`<div class="admin-challenge"><div class="challenge-icon">${categoryIcon(c.category)}</div><div class="challenge-description"><b>${escapeHTML(c.title)}</b><small>${escapeHTML(c.category)} · ${c.points} points · ${escapeHTML(c.description)}</small></div><div class="admin-actions"><button class="btn btn-light btn-small" data-edit="${escapeHTML(c.id)}">Edit</button><button class="btn btn-danger btn-small" data-delete="${escapeHTML(c.id)}">Delete</button></div></div>`).join(''):'<div class="empty-state">No challenges yet. Create one using the form.</div>';document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>editChallenge(b.dataset.edit)));document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>deleteChallenge(b.dataset.delete)))}function resetForm(){$('challengeId').value='';$('challengeFormTitle').textContent='Create a challenge';$('challengeForm').reset();$('challengePoints').value=20;$('cancelEdit').classList.add('hidden')}function editChallenge(id){const c=challenges().find(x=>x.id===id);if(!c)return;$('challengeId').value=c.id;$('challengeTitle').value=c.title;$('challengeDescription').value=c.description;$('challengePoints').value=c.points;$('challengeCategory').value=c.category;$('challengeFormTitle').textContent='Edit challenge';$('cancelEdit').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'})}function deleteChallenge(id){const c=challenges().find(x=>x.id===id);if(!c||!confirm(`Delete "${c.title}"? Student completion records for this challenge will also be removed.`))return;write(KEYS.challenges,challenges().filter(x=>x.id!==id));const d=completions();Object.keys(d).forEach(k=>d[k]=d[k].filter(x=>x!==id));write(KEYS.completions,d);render();toast('Challenge deleted.')}$('challengeForm').addEventListener('submit',e=>{e.preventDefault();const id=$('challengeId').value,title=$('challengeTitle').value.trim(),description=$('challengeDescription').value.trim(),points=Number($('challengePoints').value),category=$('challengeCategory').value;if(!title||!description||!Number.isFinite(points)||points<1){setMessage('adminMessage','Enter a title, description and positive point value.',true);return}const list=challenges();if(id){write(KEYS.challenges,list.map(c=>c.id===id?{...c,title,description,points,category}:c));setMessage('adminMessage','Challenge updated.')}else{write(KEYS.challenges,[...list,{id:'c'+Date.now().toString(36),title,description,points,category}]);setMessage('adminMessage','Challenge created.')}resetForm();render()});$('cancelEdit').addEventListener('click',resetForm);render()}

/* Extra features: persistent dark mode, daily eco tip, CSV export, and impact summary. */
function setupThemeToggle(){
  const saved=localStorage.getItem('ecocampus_theme')||'light';
  document.documentElement.dataset.theme=saved;
  const btn=document.createElement('button');
  btn.type='button';btn.className='theme-toggle';btn.id='themeToggle';
  btn.setAttribute('aria-label','Toggle dark mode');
  btn.textContent=saved==='dark'?'☀ Light mode':'☾ Dark mode';
  const nav=document.querySelector('.topbar nav');
  if(nav)nav.appendChild(btn);
  btn.addEventListener('click',()=>{
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    document.documentElement.dataset.theme=next;
    localStorage.setItem('ecocampus_theme',next);
    btn.textContent=next==='dark'?'☀ Light mode':'☾ Dark mode';
  });
}
const ecoTips=[
  'Carry a reusable bottle to reduce single-use plastic waste.',
  'Switch off lights and fans when leaving an empty room.',
  'Choose walking, cycling, or public transport when practical.',
  'Use both sides of paper or share notes digitally.',
  'Separate recyclable waste before putting it in the correct bin.',
  'Report leaking taps so water is not wasted.',
  'Bring a reusable bag instead of taking a new plastic bag.'
];
function dailyTip(){
  const day=Math.floor(Date.now()/86400000);
  return ecoTips[day%ecoTips.length];
}
function addDailyTip(){
  if(!location.pathname.endsWith('student-dashboard.html'))return;
  const main=document.querySelector('main.page');
  if(!main||document.getElementById('dailyEcoTip'))return;
  const tip=document.createElement('section');
  tip.id='dailyEcoTip';tip.className='daily-tip';
  tip.innerHTML=`<div class="tip-icon">💡</div><div><span class="eyebrow">TODAY'S ECO TIP</span><p>${escapeHTML(dailyTip())}</p></div>`;
  const stats=main.querySelector('.stat-grid');
  if(stats)stats.insertAdjacentElement('afterend',tip);else main.prepend(tip);
}
function csvCell(value){return '"'+String(value??'').replace(/"/g,'""')+'"'}
function downloadLeaderboardCSV(){
  const rows=[['Rank','Student','Email','College / department','Completed challenges','Points']];
  ranking().forEach((x,i)=>rows.push([i+1,x.u.name,x.u.email,x.u.college,x.s.done.length,x.s.points]));
  const csv=rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='ecocampus-leaderboard.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function addCSVExport(){
  const target=$('leaderboardTable')||$('adminLeaderboard');
  if(!target||document.getElementById('exportLeaderboard'))return;
  const btn=document.createElement('button');
  btn.id='exportLeaderboard';btn.type='button';btn.className='btn btn-light export-btn';
  btn.textContent='Export leaderboard CSV';btn.addEventListener('click',downloadLeaderboardCSV);
  target.parentElement.insertBefore(btn,target);
}
function addImpactSummary(){
  if(!location.pathname.endsWith('student-dashboard.html'))return;
  const u=currentUser();if(!u)return;
  const s=stats(u);
  const impact=document.createElement('section');impact.className='impact-strip';
  impact.innerHTML=`<div><span class="eyebrow">YOUR ECO IMPACT</span><h2>${s.done.length} action${s.done.length===1?'':'s'} completed</h2><p>Every completed challenge is a step toward a more sustainable campus.</p></div><div class="impact-progress"><div class="progress-label"><span>Starter challenge progress</span><b>${Math.min(s.done.length,7)}/7</b></div><div class="progress-track"><span style="width:${Math.min(s.done.length/7*100,100)}%"></span></div></div>`;
  const tip=document.getElementById('dailyEcoTip');
  if(tip)tip.insertAdjacentElement('afterend',impact);
}

init();loginInit();registerInit();
if(location.pathname.endsWith('student-dashboard.html'))dashboardInit();
if(location.pathname.endsWith('challenges.html'))challengesInit();
if(location.pathname.endsWith('leaderboard.html'))leaderboardInit();
if(location.pathname.endsWith('profile.html'))profileInit();
if(location.pathname.endsWith('admin-dashboard.html'))adminInit();
setupThemeToggle();addDailyTip();addImpactSummary();addCSVExport();
})();