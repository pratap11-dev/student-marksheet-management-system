const KEY = "studentMarksheetData_v1";
let activeRole = "admin";
let session = null;
let data = loadData();

function initialData(){
  return {students:[],subjects:[
    {id:uid(),name:"Mathematics",max:100},
    {id:uid(),name:"English",max:100},
    {id:uid(),name:"Computer Science",max:100}
  ],marks:{},admin:{username:"admin",password:"admin123"}};
}
function uid(){return "id_"+Math.random().toString(36).slice(2,10)}
function loadData(){try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):initialData()}catch(e){return initialData()}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));}
const $ = id => document.getElementById(id);
function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function show(id){["loginView","adminView","studentView"].forEach(x=>$(x).classList.add("hidden"));$(id).classList.remove("hidden");$("logoutBtn").classList.toggle("hidden",id==="loginView");}
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));btn.classList.add("active");activeRole=btn.dataset.role;
  $("userLabel").textContent=activeRole==="admin"?"Username":"Roll Number";
  $("username").placeholder=activeRole==="admin"?"Enter username":"Enter roll number";
  $("loginError").textContent="";
}));
$("loginForm").addEventListener("submit",e=>{
  e.preventDefault();const user=$("username").value.trim(),pass=$("password").value;
  if(activeRole==="admin"&&user===data.admin.username&&pass===data.admin.password){session={role:"admin"};renderAdmin();show("adminView");}
  else if(activeRole==="student"){const s=data.students.find(x=>x.roll.toLowerCase()===user.toLowerCase()&&x.password===pass);if(s){session={role:"student",studentId:s.id};$("studentWelcome").textContent=`Welcome, ${s.name} · Roll No. ${s.roll}`;renderStudent(s);show("studentView");}else $("loginError").textContent="Invalid roll number or password.";}
  else $("loginError").textContent="Invalid admin username or password.";
});
$("logoutBtn").addEventListener("click",()=>{session=null;$("loginForm").reset();$("loginError").textContent="";show("loginView");});
function renderAdmin(){
  $("studentCount").textContent=data.students.length;$("subjectCount").textContent=data.subjects.length;
  $("resultCount").textContent=Object.keys(data.marks).length;
  renderStudents();renderSubjects();fillSelectors();
}
function renderStudents(){
  const q=$("studentSearch").value.toLowerCase();
  const list=data.students.filter(s=>s.name.toLowerCase().includes(q)||s.roll.toLowerCase().includes(q));
  $("studentsTable").innerHTML=list.length?list.map(s=>`<tr><td>${escapeHTML(s.name)}</td><td>${escapeHTML(s.roll)}</td><td>${escapeHTML(s.className)}</td><td><div class="table-actions"><button class="btn secondary mini" data-edit="${s.id}">Edit</button><button class="btn danger mini" data-delete="${s.id}">Delete</button></div></td></tr>`).join(""):`<tr><td colspan="4"><div class="empty">No students found. Add a student above.</div></td></tr>`;
  $("studentsTable").querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>editStudent(b.dataset.edit));
  $("studentsTable").querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteStudent(b.dataset.delete));
}
$("studentSearch").addEventListener("input",renderStudents);
function editStudent(id){const s=data.students.find(x=>x.id===id);if(!s)return;$("editStudentId").value=s.id;$("studentName").value=s.name;$("rollNo").value=s.roll;$("studentClass").value=s.className;$("studentPassword").value=s.password;$("studentSubmit").textContent="Update Student";window.scrollTo({top:0,behavior:"smooth"});}
function clearStudentForm(){$("studentForm").reset();$("editStudentId").value="";$("studentSubmit").textContent="Save Student";}
$("cancelEdit").onclick=clearStudentForm;
$("studentForm").addEventListener("submit",e=>{
 e.preventDefault();const id=$("editStudentId").value,name=$("studentName").value.trim(),roll=$("rollNo").value.trim(),className=$("studentClass").value.trim(),password=$("studentPassword").value.trim();
 if(!password){alert("Please set a password for the student.");return;}
 if(data.students.some(s=>s.roll.toLowerCase()===roll.toLowerCase()&&s.id!==id)){alert("This roll number already exists.");return;}
 if(id){const s=data.students.find(x=>x.id===id);Object.assign(s,{name,roll,className,password});}
 else data.students.push({id:uid(),name,roll,className,password});
 save();clearStudentForm();renderAdmin();
});
function deleteStudent(id){const s=data.students.find(x=>x.id===id);if(!s||!confirm(`Delete ${s.name} and their marks?`))return;data.students=data.students.filter(x=>x.id!==id);Object.keys(data.marks).forEach(k=>{if(k.startsWith(id+"|"))delete data.marks[k]});save();renderAdmin();}
function renderSubjects(){
 $("subjectsList").innerHTML=data.subjects.length?data.subjects.map(s=>`<span class="chip">${escapeHTML(s.name)} · Max ${s.max}<button title="Delete subject" data-subdelete="${s.id}">×</button></span>`).join(""):`<p class="muted small">No subjects added.</p>`;
 $("subjectsList").querySelectorAll("[data-subdelete]").forEach(b=>b.onclick=()=>{if(!confirm("Delete this subject and its marks?"))return;const id=b.dataset.subdelete;data.subjects=data.subjects.filter(s=>s.id!==id);Object.keys(data.marks).forEach(k=>{if(k.endsWith("|"+id))delete data.marks[k]});save();renderAdmin();});
}
$("subjectForm").addEventListener("submit",e=>{e.preventDefault();const name=$("subjectName").value.trim(),max=Number($("maxMarks").value);if(!name||max<=0)return;if(data.subjects.some(s=>s.name.toLowerCase()===name.toLowerCase())){alert("Subject already exists.");return;}data.subjects.push({id:uid(),name,max});save();$("subjectForm").reset();$("maxMarks").value=100;renderAdmin();});
function fillSelectors(){
 const studentOptions=data.students.map(s=>`<option value="${s.id}">${escapeHTML(s.name)} (${escapeHTML(s.roll)})</option>`).join("");
 const subjectOptions=data.subjects.map(s=>`<option value="${s.id}">${escapeHTML(s.name)} (Max ${s.max})</option>`).join("");
 $("marksStudent").innerHTML=studentOptions||'<option value="">Add a student first</option>';
 $("resultStudent").innerHTML=studentOptions||'<option value="">No students available</option>';
 $("marksSubject").innerHTML=subjectOptions||'<option value="">Add a subject first</option>';
 renderAdminMarksheet();
}
$("marksForm").addEventListener("submit",e=>{
 e.preventDefault();const sid=$("marksStudent").value,subid=$("marksSubject").value,obt=Number($("marksObtained").value),sub=data.subjects.find(x=>x.id===subid);
 if(!sid||!sub)return;if(!Number.isFinite(obt)||obt<0||obt>sub.max){alert(`Enter marks from 0 to ${sub.max}.`);return;}
 data.marks[`${sid}|${subid}`]=obt;save();$("marksObtained").value="";renderAdmin();alert("Marks saved successfully.");
});
$("resultStudent").addEventListener("change",renderAdminMarksheet);
function grade(p){if(p>=90)return"A+";if(p>=80)return"A";if(p>=70)return"B+";if(p>=60)return"B";if(p>=50)return"C";if(p>=40)return"D";return"F";}
function buildMarksheet(student){
 const rows=data.subjects.map(sub=>{const key=`${student.id}|${sub.id}`,has=Object.prototype.hasOwnProperty.call(data.marks,key),m=data.marks[key];return {sub,has,marks:m};});
 const entered=rows.filter(r=>r.has),total=entered.reduce((a,r)=>a+r.marks,0),max=entered.reduce((a,r)=>a+r.sub.max,0),complete=entered.length===data.subjects.length&&data.subjects.length>0;
 const percent=max?total/max*100:0,passed=complete&&rows.every(r=>r.marks>=r.sub.max*.33);
 const status=complete?(passed?"PASS":"FAIL"):"PENDING";
 return `<div class="marksheet"><div class="ms-head"><h2>STUDENT MARKSHEET</h2><div>Academic Result Statement</div></div><div class="ms-meta"><div><b>Student Name:</b> ${escapeHTML(student.name)}</div><div><b>Roll Number:</b> ${escapeHTML(student.roll)}</div><div><b>Class / Semester:</b> ${escapeHTML(student.className)}</div><div><b>Result:</b> <span class="${status==="PASS"?"status-pass":status==="FAIL"?"status-fail":""}">${status}</span></div></div><div class="table-wrap"><table><thead><tr><th>Subject</th><th>Maximum Marks</th><th>Marks Obtained</th><th>Grade</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${escapeHTML(r.sub.name)}</td><td>${r.sub.max}</td><td>${r.has?r.marks:"Not entered"}</td><td>${r.has?grade(r.marks/r.sub.max*100):"—"}</td></tr>`).join("")}</tbody></table></div><div class="summary"><div><span>Total Obtained</span><strong>${total}</strong></div><div><span>Maximum (entered subjects)</span><strong>${max}</strong></div><div><span>Percentage</span><strong>${max?percent.toFixed(2)+"%":"—"}</strong></div><div><span>Overall Grade</span><strong>${complete?grade(percent):"—"}</strong></div></div></div><div class="print-row"><button class="btn primary" onclick="window.print()">Print / Save as PDF</button></div>`;
}
function renderAdminMarksheet(){const s=data.students.find(x=>x.id===$("resultStudent").value);$("adminMarksheet").innerHTML=s?buildMarksheet(s):'<div class="empty">Add a student to view a marksheet.</div>';}
function renderStudent(s){$("studentMarksheet").innerHTML=buildMarksheet(s);}
$("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="marksheet-backup.json";a.click();URL.revokeObjectURL(url);};
$("importFile").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed.students)||!Array.isArray(parsed.subjects)||!parsed.marks||!parsed.admin)throw new Error("Invalid backup format");if(confirm("Import backup? This will replace current project data.")){data=parsed;save();renderAdmin();alert("Backup imported.");}}catch(err){alert("Could not import this file. Please select a valid project backup.");}e.target.value="";});
show("loginView");
