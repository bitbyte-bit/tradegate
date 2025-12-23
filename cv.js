// CV Builder - Full Features (separate JS file)

// Storage
const STORAGE_KEY = 'cv_builder_v2';

// Model
let data = load() || {
  name: '', role: '', email: '', phone: '', location: '', summary: '',
  xp: [], edu: [], skills: [], proj: []
};

// Elements
const el = id => document.getElementById(id);
const inputs = {
  name: el('name'), role: el('role'), email: el('email'), phone: el('phone'),
  location: el('location'), summary: el('summary')
};
const lists = {
  xp: el('xpList'), edu: el('eduList'), skills: el('skillsList'), proj: el('projList')
};
const pv = {
  name: el('pv_name'), role: el('pv_role'), contact: el('pv_contact'),
  summaryWrap: el('pv_summary_wrap'), summary: el('pv_summary'),
  xpWrap: el('pv_xp_wrap'), xp: el('pv_xp'),
  eduWrap: el('pv_edu_wrap'), edu: el('pv_edu'),
  skillsWrap: el('pv_skills_wrap'), skills: el('pv_skills'),
  projWrap: el('pv_proj_wrap'), proj: el('pv_proj')
};

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Bind top inputs
  bindInputs();

  // Bind actions
  bindActions();

  // Restore template and theme
  restoreTemplate();
  restoreTheme();

  // Initial renders
  renderEditor();
  renderPreview();
});

/* Actions */

function bindActions() {
  // Add item buttons
  el('addXp').onclick = () => addItem('xp', { role:'', company:'', location:'', start:'', end:'', bullets:[''] });
  el('addEdu').onclick = () => addItem('edu', { degree:'', school:'', location:'', start:'', end:'' });
  el('addSkill').onclick = () => addItem('skills', { name:'' });
  el('addProj').onclick = () => addItem('proj', { name:'', link:'', desc:'' });

  // Save/Clear
  el('save').onclick = () => { save(); alert('Saved.'); };
  el('clear').onclick = () => {
    if (!confirm('Clear all data?')) return;
    data = { name:'', role:'', email:'', phone:'', location:'', summary:'', xp:[], edu:[], skills:[], proj:[] };
    save();
    renderAll();
  };

  // Theme and template
  el('toggleTheme').onclick = () => toggleTheme();
  el('templateSelect').onchange = () => setTemplate(el('templateSelect').value);

  // PDF download
  el('downloadPdf').onclick = exportPDF;
}

/* Inputs and Editor */

function bindInputs() {
  Object.entries(inputs).forEach(([k, input]) => {
    input.value = data[k] || '';
    input.addEventListener('input', () => {
      data[k] = input.value;
      renderPreview();
      save();
    });
  });
}

function addItem(key, item) {
  data[key].push(item);
  renderEditor();
  renderPreview();
  save();
}

function renderEditor() {
  // Experience
  lists.xp.innerHTML = '';
  data.xp.forEach((xp, i) => lists.xp.appendChild(xpEditorItem(xp, i)));

  // Education
  lists.edu.innerHTML = '';
  data.edu.forEach((e, i) => lists.edu.appendChild(eduEditorItem(e, i)));

  // Skills
  lists.skills.innerHTML = '';
  data.skills.forEach((s, i) => lists.skills.appendChild(skillEditorItem(s, i)));

  // Projects
  lists.proj.innerHTML = '';
  data.proj.forEach((p, i) => lists.proj.appendChild(projEditorItem(p, i)));
}

/* Editor components */

function xpEditorItem(xp, i) {
  const wrap = document.createElement('div');
  wrap.className = 'item';
  wrap.innerHTML = `
    <div class="row">
      <div><label>Role</label><input value="${escape(xp.role)}" data-k="role"></div>
      <div><label>Company</label><input value="${escape(xp.company)}" data-k="company"></div>
    </div>
    <div class="row">
      <div><label>Location</label><input value="${escape(xp.location)}" data-k="location"></div>
      <div class="row">
        <div><label>Start</label><input value="${escape(xp.start)}" data-k="start" placeholder="YYYY-MM"></div>
        <div><label>End</label><input value="${escape(xp.end)}" data-k="end" placeholder="YYYY-MM or Present"></div>
      </div>
    </div>
    <label>Bullets</label>
    <div class="list bullets"></div>
    <div class="actions">
      <button class="btn primary" data-action="add-bullet">Add bullet</button>
      <button class="btn danger" data-action="remove">Remove</button>
    </div>
  `;
  const bulletsWrap = wrap.querySelector('.bullets');
  xp.bullets = xp.bullets || [''];
  xp.bullets.forEach((b, bi) => {
    const li = document.createElement('div');
    li.innerHTML = `
      <input value="${escape(b)}" data-bullet="${bi}" placeholder="What did you achieve?">
      <button class="btn danger" data-remove-bullet="${bi}">Remove</button>`;
    bulletsWrap.appendChild(li);
  });

  wrap.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => {
      const key = inp.getAttribute('data-k');
      if (key) data.xp[i][key] = inp.value;
      const bi = inp.getAttribute('data-bullet');
      if (bi !== null) data.xp[i].bullets[Number(bi)] = inp.value;
      renderPreview();
      save();
    });
  });

  wrap.querySelector('[data-action="add-bullet"]').onclick = () => {
    data.xp[i].bullets.push('');
    renderEditor(); renderPreview(); save();
  };
  wrap.querySelector('[data-action="remove"]').onclick = () => {
    if (confirm('Remove this experience item?')) {
      data.xp.splice(i,1);
      renderEditor(); renderPreview(); save();
    }
  };
  bulletsWrap.querySelectorAll('[data-remove-bullet]').forEach(btn => {
    btn.onclick = () => {
      const bi = Number(btn.getAttribute('data-remove-bullet'));
      data.xp[i].bullets.splice(bi,1);
      renderEditor(); renderPreview(); save();
    };
  });
  return wrap;
}

function eduEditorItem(e, i) {
  const wrap = document.createElement('div');
  wrap.className = 'item';
  wrap.innerHTML = `
    <div class="row">
      <div><label>Degree</label><input value="${escape(e.degree)}" data-k="degree"></div>
      <div><label>School</label><input value="${escape(e.school)}" data-k="school"></div>
    </div>
    <div class="row">
      <div><label>Location</label><input value="${escape(e.location)}" data-k="location"></div>
      <div class="row">
        <div><label>Start</label><input value="${escape(e.start)}" data-k="start" placeholder="YYYY"></div>
        <div><label>End</label><input value="${escape(e.end)}" data-k="end" placeholder="YYYY"></div>
      </div>
    </div>
    <div class="actions">
      <button class="btn danger" data-action="remove">Remove</button>
    </div>
  `;
  wrap.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => {
      data.edu[i][inp.getAttribute('data-k')] = inp.value;
      renderPreview(); save();
    });
  });
  wrap.querySelector('[data-action="remove"]').onclick = () => {
    if (confirm('Remove this education item?')) {
      data.edu.splice(i,1); renderEditor(); renderPreview(); save();
    }
  };
  return wrap;
}

function skillEditorItem(s, i) {
  const wrap = document.createElement('div');
  wrap.className = 'item';
  wrap.innerHTML = `
    <div class="row">
      <div><label>Skill</label><input value="${escape(s.name)}" data-k="name"></div>
      <div class="actions"><button class="btn danger" data-action="remove">Remove</button></div>
    </div>
  `;
  wrap.querySelector('[data-k="name"]').addEventListener('input', (e) => {
    data.skills[i].name = e.target.value; renderPreview(); save();
  });
  wrap.querySelector('[data-action="remove"]').onclick = () => {
    if (confirm('Remove this skill?')) {
      data.skills.splice(i,1); renderEditor(); renderPreview(); save();
    }
  };
  return wrap;
}

function projEditorItem(p, i) {
  const wrap = document.createElement('div');
  wrap.className = 'item';
  wrap.innerHTML = `
    <div class="row">
      <div><label>Name</label><input value="${escape(p.name)}" data-k="name"></div>
      <div><label>Link</label><input value="${escape(p.link)}" data-k="link" placeholder="https://"></div>
    </div>
    <label>Description</label>
    <textarea data-k="desc">${escape(p.desc)}</textarea>
    <div class="actions">
      <button class="btn danger" data-action="remove">Remove</button>
    </div>
  `;
  wrap.querySelectorAll('input,textarea').forEach(inp => {
    inp.addEventListener('input', () => {
      data.proj[i][inp.getAttribute('data-k')] = inp.value;
      renderPreview(); save();
    });
  });
  wrap.querySelector('[data-action="remove"]').onclick = () => {
    if (confirm('Remove this project?')) {
      data.proj.splice(i,1); renderEditor(); renderPreview(); save();
    }
  };
  return wrap;
}

/* Preview */

function renderPreview() {
  pv.name.textContent = data.name || 'Your Name';
  pv.role.textContent = data.role || 'Your Title';
  const contactItems = [data.email, data.phone, data.location].filter(Boolean);
  pv.contact.textContent = contactItems.length ? contactItems.join(' • ') : 'Email • Phone • Location';

  // Summary
  toggle(pv.summaryWrap, !!(data.summary && data.summary.trim()));
  pv.summary.textContent = data.summary || '';

  // Experience
  toggle(pv.xpWrap, data.xp.length > 0);
  pv.xp.innerHTML = '';
  data.xp.forEach(x => {
    const div = document.createElement('div');
    div.className = 'xp-item';
    div.innerHTML = `
      <div class="xp-head">
        <div>${escape(x.role || '')} — ${escape(x.company || '')}</div>
        <div>${escape(x.start || '')} — ${escape(x.end || '')}</div>
      </div>
      <div style="color:var(--muted);font-size:12px">${escape(x.location || '')}</div>
    `;
    const ul = document.createElement('ul');
    ul.style.margin = '6px 0 0 16px';
    (x.bullets || []).filter(b => b && b.trim()).forEach(b => {
      const li = document.createElement('li');
      li.textContent = b;
      ul.appendChild(li);
    });
    div.appendChild(ul);
    pv.xp.appendChild(div);
  });

  // Education
  toggle(pv.eduWrap, data.edu.length > 0);
  pv.edu.innerHTML = '';
  data.edu.forEach(e => {
    const div = document.createElement('div');
    div.className = 'edu-item';
    div.innerHTML = `
      <div class="edu-head">
        <div>${escape(e.degree || '')} — ${escape(e.school || '')}</div>
        <div>${escape(e.start || '')} — ${escape(e.end || '')}</div>
      </div>
      <div style="color:var(--muted);font-size:12px">${escape(e.location || '')}</div>
    `;
    pv.edu.appendChild(div);
  });

  // Skills
  toggle(pv.skillsWrap, data.skills.length > 0);
  pv.skills.innerHTML = '';
  data.skills.forEach(s => {
    const chip = document.createElement('span');
    chip.className = 'skill';
    chip.textContent = s.name || '';
    pv.skills.appendChild(chip);
  });

  // Projects
  toggle(pv.projWrap, data.proj.length > 0);
  pv.proj.innerHTML = '';
  data.proj.forEach(p => {
    const div = document.createElement('div');
    div.className = 'proj-item';
    const link = p.link ? `<a href="${escape(p.link)}" target="_blank" style="color:var(--link);text-decoration:none">${escape(p.link)}</a>` : '';
    div.innerHTML = `
      <div class="proj-head">
        <div>${escape(p.name || '')}</div>
        <div>${link}</div>
      </div>
      <div style="margin-top:6px">${escape(p.desc || '')}</div>
    `;
    pv.proj.appendChild(div);
  });
}

/* Template and Theme */

function setTemplate(val) {
  document.body.classList.remove('template-creative', 'template-minimalist', 'template-academic');
  document.body.classList.add('template-' + val);
  localStorage.setItem('cv_template', val);
}

function restoreTemplate() {
  const templateSelect = el('templateSelect');
  const saved = localStorage.getItem('cv_template') || 'creative';
  setTemplate(saved);
  templateSelect.value = saved;
}

function toggleTheme() {
  const isLight = document.body.classList.contains('light');
  document.body.classList.toggle('light', !isLight);
  localStorage.setItem('cv_theme', !isLight ? 'light' : 'dark');
}

function restoreTheme() {
  const saved = localStorage.getItem('cv_theme');
  if (saved === 'light') document.body.classList.add('light');
}

/* PDF Export */

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'pt', format:'a4' });
  let y = 40, x = 40, line = 16;

  // Header
  doc.setFont('helvetica','bold'); doc.setFontSize(20);
  doc.text(data.name || 'Your Name', x, y); y += 22;

  doc.setFont('helvetica','normal'); doc.setFontSize(12);
  doc.text(data.role || 'Your Title', x, y); y += 18;

  const contact = [data.email, data.phone, data.location].filter(Boolean).join(' • ') || 'Email • Phone • Location';
  doc.setTextColor(120); doc.text(contact, x, y); y += 22; doc.setTextColor(0);

  // Helpers
  function section(title){
    doc.setFont('helvetica','bold'); doc.setFontSize(12);
    doc.text(title, x, y); y += 8;
    doc.setDrawColor(180); doc.line(x, y, 555, y); y += 12;
    doc.setFont('helvetica','normal'); doc.setFontSize(11);
  }
  function addLines(text){
    const lines = doc.splitTextToSize(text, 515);
    for (const l of lines) {
      if (y > 780) { doc.addPage(); y = 40; }
      doc.text(l, x, y); y += line;
    }
  }

  // Summary
  if (data.summary && data.summary.trim()) {
    section('Summary');
    addLines(data.summary.trim());
    y += 6;
  }

  // Experience
  if (data.xp.length) {
    section('Experience');
    data.xp.forEach(xp => {
      addLines(`${(xp.role||'')} — ${(xp.company||'')} (${(xp.start||'')} — ${(xp.end||'')})`);
      if (xp.location) addLines(`${xp.location}`);
      (xp.bullets||[]).filter(b => b && b.trim()).forEach(b => addLines('• ' + b.trim()));
      y += 6;
    });
  }

  // Education
  if (data.edu.length) {
    section('Education');
    data.edu.forEach(e => {
      addLines(`${(e.degree||'')} — ${(e.school||'')} (${(e.start||'')} — ${(e.end||'')})`);
      if (e.location) addLines(`${e.location}`);
      y += 6;
    });
  }

  // Skills
  if (data.skills.length) {
    section('Skills');
    addLines(data.skills.map(s => s.name).filter(Boolean).join(', '));
    y += 6;
  }

  // Projects
  if (data.proj.length) {
    section('Projects');
    data.proj.forEach(p => {
      addLines(`${(p.name||'')}${p.link ? ' — ' + p.link : ''}`);
      if (p.desc) addLines(p.desc);
      y += 6;
    });
  }

  doc.save('CV.pdf');
}

/* Save/Load and utilities */

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function load(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || ''); } catch { return null; } }

function renderAll(){ bindInputs(); renderEditor(); renderPreview(); }
function toggle(node, visible){ node.style.display = visible ? '' : 'none'; }

function escape(s){
  return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

