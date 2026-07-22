const teacherDialog=document.querySelector('#questionDialog');
const teacherForm=document.querySelector('#questionForm');
const teacherQueue=document.querySelector('#teacherQueue');
let activeEditKey='';

function teacherKey(q){return q._local_id||q.question_id||recordKey(q)}
function makeLocalId(){return `LOCAL-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`}
function syncTeacherData(){saveImported();questions=[...seedQuestions,...imported].map(enrichRecord);refreshFilters();render();renderTeacherWorkspace()}
function editorChapters(form='Form 4',selected=''){
  const select=document.querySelector('#editorChapter');
  const values=sejarahCatalog[form]||uniq('chapter');
  select.innerHTML=values.map(v=>`<option value="${safe(v)}">${safe(v)}</option>`).join('');
  if(values.includes(selected))select.value=selected;
}
function openQuestionEditor(q=null){
  teacherForm.reset();activeEditKey='';document.querySelector('[name="edit_key"]').value='';
  document.querySelector('#dialogTitle').textContent=q?'编辑题目':'新增题目';
  document.querySelector('#deleteQuestionBtn').classList.toggle('hidden',!q);
  if(q){
    activeEditKey=teacherKey(q);document.querySelector('[name="edit_key"]').value=activeEditKey;
    [...teacherForm.elements].forEach(el=>{if(!el.name||el.name==='edit_key')return;if(el.type==='checkbox')el.checked=Boolean(q[el.name]);else if(q[el.name]!=null)el.value=q[el.name]});
    editorChapters(q.form,q.chapter);
  }else{
    teacherForm.elements.year.value=new Date().getFullYear();teacherForm.elements.source.value='Trial Negeri';teacherForm.elements.paper.value='Paper 2';teacherForm.elements.type.value='Struktur';teacherForm.elements.marks.value=4;editorChapters('Form 4');
  }
  teacherDialog.showModal();
}
function formToTeacherRecord(){
  const fd=new FormData(teacherForm);const obj=Object.fromEntries(fd.entries());
  const old=imported.find(q=>teacherKey(q)===activeEditKey)||{};
  return enrichRecord({...old,...obj,year:Number(obj.year),marks:Number(obj.marks),verified:teacherForm.elements.verified.checked,high_value:teacherForm.elements.high_value.checked,question_id:old.question_id||'',official:old.official??.6,importance:old.importance??70,gap:old.gap??50,trial:old.trial??60,fit:old.fit??70,skill:old.skill??70,curriculum:old.curriculum||'KSSM',_local_id:old._local_id||makeLocalId(),teacher_note:obj.teacher_note||'',source_url:obj.source_url||'',duplicate_group:obj.duplicate_group||'',state:obj.state||'',section:obj.section||'',question_no:obj.question_no||'',command_word:obj.command_word||'',cognitive:obj.cognitive||'',skills:obj.skills||''});
}
function renderTeacherWorkspace(){
  if(!teacherQueue)return;
  const editable=imported;const pending=editable.filter(q=>!q.verified);const high=editable.filter(q=>q.high_value);
  document.querySelector('#teacherStats').innerHTML=[['本机题目',editable.length,'editable'],['待审核',pending.length,'review queue'],['高价值题',high.length,'teacher marked'],['完整来源',editable.filter(q=>q.source_url).length,'with source URL']].map(x=>`<div class="stat"><span>${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></div>`).join('');
  const rows=[...editable].sort((a,b)=>Number(a.verified)-Number(b.verified)||b.year-a.year);
  teacherQueue.innerHTML=rows.length?rows.map(q=>`<div class="teacher-row"><div><div class="teacher-title"><strong>${safe(q.chapter)}</strong>${q.high_value?'<span class="value-badge">高价值</span>':''}</div><p>${safe(q.topic)} · ${safe(q.form)} · ${safe(q.year)} · ${safe(q.source)}</p><small>${safe(q.question_id||q._local_id||'Local record')} · ${q.verified?'已验证':'待审核'}${q.teacher_note?` · ${safe(q.teacher_note)}`:''}</small></div><div class="teacher-actions">${!q.verified?`<button class="verify-one secondary small" data-key="${safe(teacherKey(q))}">通过审核</button>`:''}<button class="edit-one secondary small" data-key="${safe(teacherKey(q))}">编辑</button></div></div>`).join(''):'<div class="empty">还没有本机题目。点击“新增题目”开始建立真实题库。</div>';
  document.querySelectorAll('.edit-one').forEach(btn=>btn.onclick=()=>openQuestionEditor(imported.find(q=>teacherKey(q)===btn.dataset.key)));
  document.querySelectorAll('.verify-one').forEach(btn=>btn.onclick=()=>{const q=imported.find(x=>teacherKey(x)===btn.dataset.key);if(q){q.verified=true;syncTeacherData()}});
}

document.querySelector('#addQuestionBtn').addEventListener('click',()=>openQuestionEditor());
document.querySelector('#closeDialogBtn').addEventListener('click',()=>teacherDialog.close());
document.querySelector('#cancelDialogBtn').addEventListener('click',()=>teacherDialog.close());
teacherForm.elements.form.addEventListener('change',e=>editorChapters(e.target.value));
teacherForm.addEventListener('submit',e=>{e.preventDefault();const q=formToTeacherRecord();const idx=imported.findIndex(x=>teacherKey(x)===activeEditKey);if(idx>=0)imported[idx]=q;else imported.push(q);teacherDialog.close();syncTeacherData()});
document.querySelector('#deleteQuestionBtn').addEventListener('click',()=>{if(!activeEditKey||!confirm('确定删除这道本机题目？'))return;imported=imported.filter(q=>teacherKey(q)!==activeEditKey);teacherDialog.close();syncTeacherData()});
document.querySelector('#verifyVisibleBtn').addEventListener('click',()=>{const visibleKeys=new Set(filtered().map(teacherKey));let changed=0;imported.forEach(q=>{if(!q.verified&&visibleKeys.has(teacherKey(q))){q.verified=true;changed++}});if(!changed){alert('当前筛选范围没有可审核的本机题目。');return}syncTeacherData()});

const originalRender=render;
render=function(){originalRender();renderTeacherWorkspace()};
renderTeacherWorkspace();