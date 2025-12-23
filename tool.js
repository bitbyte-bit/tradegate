// Business Records System - script.js (complete)

const STORAGE_KEY = 'biz_records_v6';
let records = loadRecords();
let editingId = null;

// Elements
const el = (id) => document.getElementById(id);

// Form fields
const dateEl = el('date'), typeEl = el('type'), categoryEl = el('category'),
      amountEl = el('amount'), debitEl = el('debit'), methodEl = el('method'),
      referenceEl = el('reference'), notesEl = el('notes'),
      recorderNameEl = el('recorderName'), recorderPhoneEl = el('recorderPhone');

// Filters and stats
const startDateEl = el('startDate'), endDateEl = el('endDate'), filterCategoryEl = el('filterCategory');
const incomeTotalEl = el('incomeTotal'), expenseTotalEl = el('expenseTotal'), netTotalEl = el('netTotal');
const tbodyEl = el('tbody');

// Buttons
const addBtn = el('addBtn'), exportCsvBtn = el('exportCsvBtn'), exportPdfBtn = el('exportPdfBtn'), clearBtn = el('clearBtn');
const applyFiltersBtn = el('applyFilters'), resetFiltersBtn = el('resetFilters');
const themeToggle = el('themeToggle'), showAnalyticsBtn = el('showAnalyticsBtn');

// Edit modal
const modalBackdrop = el('modalBackdrop'), closeModalBtn = el('closeModalBtn'),
      saveEditBtn = el('saveEditBtn'), deleteEditBtn = el('deleteEditBtn'), editFooter = el('editFooter');

const edit = {
  type: el('edit_type'), date: el('edit_date'), category: el('edit_category'),
  amount: el('edit_amount'), debit: el('edit_debit'), method: el('edit_method'),
  reference: el('edit_reference'), notes: el('edit_notes')
};

// Analytics overlay
const analyticsOverlay = el('analyticsOverlay'), closeAnalyticsBtn = el('closeAnalyticsBtn');
const exportMonthlyImg = el('exportMonthlyImg'), exportCategoryImg = el('exportCategoryImg'),
      exportDebitImg = el('exportDebitImg'), exportCashflowImg = el('exportCashflowImg');

// Charts
let monthlyChart, categoryChart, debitChart, cashflowChart;

document.addEventListener('DOMContentLoaded', () => {
  // Prefill today
  dateEl.value = new Date().toISOString().slice(0,10);

  // Events
  addBtn.addEventListener('click', onAdd);
  exportCsvBtn.addEventListener('click', exportCSV);
  exportPdfBtn.addEventListener('click', exportPDF);
  clearBtn.addEventListener('click', clearAll);

  applyFiltersBtn.addEventListener('click', () => { render(); });
  resetFiltersBtn.addEventListener('click', () => {
    startDateEl.value = ''; endDateEl.value = ''; filterCategoryEl.value = ''; render();
  });

  themeToggle.addEventListener('click', toggleTheme);
  restoreTheme();

  showAnalyticsBtn.addEventListener('click', () => {
    analyticsOverlay.style.display = 'flex';
    updateCharts(applyFilters(records));
  });
  closeAnalyticsBtn.addEventListener('click', () => { analyticsOverlay.style.display = 'none'; });

  closeModalBtn.addEventListener('click', closeModal);
  saveEditBtn.addEventListener('click', saveEdit);
  deleteEditBtn.addEventListener('click', deleteFromModal);

  // Init charts + initial render
  initCharts();
  render();
});

/* CRUD */

function onAdd() {
  const r = getFormRecord();
  if (!r) return;
  records.push(r);
  saveRecords();
  clearForm();
  render();
}

function getFormRecord() {
  const type = typeEl.value;
  const date = dateEl.value;
  const category = (categoryEl.value || '').trim();
  const amount = parseFloat(amountEl.value || '0');
  const debit = parseFloat(debitEl.value || '0');
  const method = methodEl.value;
  const reference = (referenceEl.value || '').trim();
  const notes = (notesEl.value || '').trim();
  const recorderName = (recorderNameEl.value || '').trim();
  const recorderPhone = (recorderPhoneEl.value || '').trim();

  if (!date || !category || isNaN(amount) || amount <= 0) {
    alert('Please provide a valid date, category, and an amount greater than 0.');
    return null;
  }
  return { id: cryptoId(), type, date, category, amount, debit, method, reference, notes, recorderName, recorderPhone };
}

function clearForm() {
  typeEl.value = 'income';
  dateEl.value = '';
  categoryEl.value = '';
  amountEl.value = '';
  debitEl.value = '';
  methodEl.value = 'cash';
  referenceEl.value = '';
  notesEl.value = '';
  recorderNameEl.value = '';
  recorderPhoneEl.value = '';
}

/* Filters, table, stats */

function render() {
  const filtered = applyFilters(records);
  renderTable(filtered);
  renderStats(filtered);
}

function applyFilters(list) {
  const start = startDateEl.value ? new Date(startDateEl.value) : null;
  const end = endDateEl.value ? new Date(endDateEl.value) : null;
  const cat = (filterCategoryEl.value || '').trim().toLowerCase();

  return list.filter(r => {
    const d = new Date(r.date);
    const inStart = !start || d >= start;
    const inEnd = !end || d <= end;
    const inCat = !cat || r.category.toLowerCase().includes(cat);
    return inStart && inEnd && inCat;
  });
}

function renderTable(list) {
  tbodyEl.innerHTML = '';
  if (list.length === 0) {
    tbodyEl.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--muted)">No records found.</td></tr>';
    return;
  }
  const ordered = list.slice().sort((a,b)=> new Date(a.date) - new Date(b.date));
  ordered.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.date}</td>
      <td class="${r.type === 'income' ? 'badge-income' : 'badge-expense'}">${r.type}</td>
      <td>${escapeHTML(r.category)}</td>
      <td>${formatCurrency(r.amount)}</td>
      <td>${formatCurrency(r.debit || 0)}</td>
      <td>${escapeHTML(r.method)}</td>
      <td>${escapeHTML(r.reference || '')}</td>
      <td>${escapeHTML(r.notes || '')}</td>
      <td>${escapeHTML(r.recorderName || '—')} (${escapeHTML(r.recorderPhone || '—')})</td>
      <td>
        <button class="icon-btn" title="Edit" onclick="openEdit('${r.id}')">
          <span class="material-icons">edit</span>
        </button>
      </td>
    `;
    tr.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      openEdit(r.id);
    });
    tbodyEl.appendChild(tr);
  });
}

function renderStats(list) {
  const income = list.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const expense = list.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const net = income - expense;
  incomeTotalEl.textContent = formatCurrency(income);
  expenseTotalEl.textContent = formatCurrency(expense);
  netTotalEl.textContent = formatCurrency(net);
}

/* Edit modal */

window.openEdit = function(id) {
  const r = records.find(x => x.id === id);
  if (!r) return;
  editingId = id;
  edit.type.value = r.type;
  edit.date.value = r.date;
  edit.category.value = r.category;
  edit.amount.value = r.amount;
  edit.debit.value = r.debit || 0;
  edit.method.value = r.method;
  edit.reference.value = r.reference || '';
  edit.notes.value = r.notes || '';
  editFooter.textContent = `Recorded by: ${r.recorderName || '—'} (${r.recorderPhone || '—'})`;
  openModal();
};

function openModal() { modalBackdrop.style.display = 'flex'; }
function closeModal() { modalBackdrop.style.display = 'none'; editingId = null; }

function saveEdit() {
  if (!editingId) return;
  const idx = records.findIndex(r => r.id === editingId);
  if (idx === -1) return;

  const updated = {
    ...records[idx],
    type: edit.type.value,
    date: edit.date.value,
    category: (edit.category.value || '').trim(),
    amount: parseFloat(edit.amount.value || '0'),
    debit: parseFloat(edit.debit.value || '0'),
    method: edit.method.value,
    reference: (edit.reference.value || '').trim(),
    notes: (edit.notes.value || '').trim()
  };
  if (!updated.date || !updated.category || isNaN(updated.amount) || updated.amount <= 0) {
    alert('Please provide a valid date, category, and an amount greater than 0.');
    return;
  }
  records[idx] = updated;
  saveRecords();
  closeModal();
  render();
}

function deleteFromModal() {
  if (!editingId) return;
  if (!confirm('Delete this record?')) return;
  records = records.filter(r => r.id !== editingId);
  saveRecords();
  closeModal();
  render();
}

/* CSV / PDF export */

function exportCSV() {
  const headers = ['type','date','category','amount','debit','method','reference','notes','recorderName','recorderPhone','id'];
  const rows = [headers.join(',')].concat(records.map(r => headers.map(h => csvEscape(r[h])).join(',')));
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, 'business-records.csv');
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('Business Records Report', 14, 18);
  let y = 28;
  doc.setFontSize(10);
  const headers = ['Date','Type','Category','Amount','Debit','Method','Ref','Recorder'];
  doc.text(headers.join(' | '), 14, y);
  y += 6;
  records.forEach(r => {
    const row = [
      r.date, r.type, r.category,
      fmtAmount(r.amount), fmtAmount(r.debit || 0),
      r.method, r.reference || '',
      `${r.recorderName || '—'} (${r.recorderPhone || '—'})`
    ].join(' | ');
    doc.text(row, 14, y);
    y += 6;
    if (y > 280) { doc.addPage(); y = 20; }
  });
  doc.save('business-records.pdf');
}

/* Analytics: charts + image export */

function initCharts() {
  monthlyChart = new Chart(document.getElementById('monthlyChart'), {
    type: 'bar',
    data: { labels: [], datasets: [
      { label: 'Income', data: [], backgroundColor: '#3fb950' },
      { label: 'Expense', data: [], backgroundColor: '#f85149' }
    ]},
    options: baseChartOptions()
  });

  categoryChart = new Chart(document.getElementById('categoryChart'), {
    type: 'pie',
    data: { labels: [], datasets: [{ data: [], backgroundColor: palette(10) }] },
    options: { plugins: { legend: { labels: { color: getVar('--text') } } } }
  });

  debitChart = new Chart(document.getElementById('debitChart'), {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Debit over time', data: [], borderColor: '#58a6ff', tension: 0.2 }] },
    options: baseChartOptions()
  });

  cashflowChart = new Chart(document.getElementById('cashflowChart'), {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Net cumulative', data: [], borderColor: '#bf7af0', tension: 0.2 }] },
    options: baseChartOptions()
  });

  // Export image buttons
  exportMonthlyImg.addEventListener('click', () => exportChartImage(monthlyChart, 'monthly-totals.png'));
  exportCategoryImg.addEventListener('click', () => exportChartImage(categoryChart, 'category-breakdown.png'));
  exportDebitImg.addEventListener('click', () => exportChartImage(debitChart, 'debit-over-time.png'));
  exportCashflowImg.addEventListener('click', () => exportChartImage(cashflowChart, 'cashflow-cumulative.png'));
}

function updateCharts(list) {
  // Monthly totals
  const monthly = groupByMonth(list);
  const labels = Object.keys(monthly).sort();
  monthlyChart.data.labels = labels;
  monthlyChart.data.datasets[0].data = labels.map(m => monthly[m].income);
  monthlyChart.data.datasets[1].data = labels.map(m => monthly[m].expense);
  monthlyChart.update();

  // Category net
  const byCat = {};
  list.forEach(r => {
    const key = r.category.trim() || 'Uncategorized';
    byCat[key] = (byCat[key] || 0) + (r.type === 'income' ? r.amount : -r.amount);
  });
  const catLabels = Object.keys(byCat);
  categoryChart.data.labels = catLabels;
  categoryChart.data.datasets[0].data = catLabels.map(k => Number(byCat[k].toFixed(2)));
  categoryChart.data.datasets[0].backgroundColor = palette(catLabels.length);
  categoryChart.update();

  // Debit over time
  const ordered = list.slice().sort((a,b)=> new Date(a.date) - new Date(b.date));
  debitChart.data.labels = ordered.map(r => r.date);
  debitChart.data.datasets[0].data = ordered.map(r => Number((r.debit || 0).toFixed(2)));
  debitChart.update();

  // Net cumulative
  let running = 0;
  const cfLabels = ordered.map(r => r.date);
  const cfData = ordered.map(r => {
    running += (r.type === 'income' ? r.amount : -r.amount);
    return Number(running.toFixed(2));
  });
  cashflowChart.data.labels = cfLabels;
  cashflowChart.data.datasets[0].data = cfData;
  cashflowChart.update();
}

/* Theme */

function toggleTheme() {
  const body = document.body;
  const isLight = body.classList.contains('theme-light');
  body.classList.toggle('theme-light', !isLight);
  body.classList.toggle('theme-dark', isLight);
  localStorage.setItem('theme_pref', body.classList.contains('theme-light') ? 'light' : 'dark');
  applyChartTheme();
}

function restoreTheme() {
  const saved = localStorage.getItem('theme_pref');
  if (saved === 'light') {
    document.body.classList.add('theme-light');
    document.body.classList.remove('theme-dark');
  } else {
    document.body.classList.add('theme-dark');
    document.body.classList.remove('theme-light');
  }
  applyChartTheme();
}

function applyChartTheme() {
  const textColor = getVar('--text');
  const gridColor = getVar('--border');
  [monthlyChart, debitChart, cashflowChart].forEach(ch => {
    if (!ch) return;
    ch.options.scales = ch.options.scales || {};
    ['x','y'].forEach(axis => {
      const s = ch.options.scales[axis] = ch.options.scales[axis] || {};
      s.ticks = s.ticks || {};
      s.grid = s.grid || {};
      s.ticks.color = textColor;
      s.grid.color = gridColor;
    });
    ch.options.plugins = ch.options.plugins || {};
    ch.options.plugins.legend = ch.options.plugins.legend || {};
    ch.options.plugins.legend.labels = ch.options.plugins.legend.labels || {};
    ch.options.plugins.legend.labels.color = textColor;
    ch.update();
  });
  if (categoryChart) {
    categoryChart.options.plugins = categoryChart.options.plugins || {};
    categoryChart.options.plugins.legend = categoryChart.options.plugins.legend || {};
    categoryChart.options.plugins.legend.labels = categoryChart.options.plugins.legend.labels || {};
    categoryChart.options.plugins.legend.labels.color = textColor;
    categoryChart.update();
  }
}

/* Helpers */

function baseChartOptions() {
  return {
    responsive: true,
    plugins: { legend: { labels: { color: getVar('--text') } } },
    scales: {
      x: { ticks: { color: getVar('--text') }, grid: { color: getVar('--border') } },
      y: { ticks: { color: getVar('--text') }, grid: { color: getVar('--border') } }
    }
  };
}

function groupByMonth(list) {
  const out = {};
  list.forEach(r => {
    const d = new Date(r.date);
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if (!out[key]) out[key] = { income: 0, expense: 0 };
    if (r.type === 'income') out[key].income += r.amount;
    else out[key].expense += r.amount;
  });
  return out;
}

function formatCurrency(v) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(v || 0);
  } catch {
    return 'UGX ' + Number(v || 0).toFixed(0);
  }
}

function fmtAmount(v) { return Number(v || 0).toFixed(2); }

function saveRecords() { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
function loadRecords() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } }

function csvEscape(s) {
  if (s === undefined || s === null) return '';
  s = String(s);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function escapeHTML(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function cryptoId() {
  if (window.crypto && crypto.getRandomValues) {
    const a = new Uint32Array(4); crypto.getRandomValues(a);
    return Array.from(a).map(n => n.toString(16)).join('');
  }
  return String(Date.now()) + Math.random().toString(16).slice(2);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportChartImage(chart, filename) {
  const url = chart.toBase64Image();
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
}

function getVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim() || '#e6edf3';
}

