// Stock management functions

function makeStockRows(stocks, targetEl) {
  if (!stocks.length) {
    document.getElementById(targetEl).innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted)">No items found</div>';
    return;
  }
  const low = stocks.filter(s => s.MaxQty && (s.AvailableQty || 0) / s.MaxQty <= 0.3).length;
  if (targetEl === 'stock-tbody') document.getElementById('low-stock-num').textContent = low < 10 ? '0' + low : low;
  const colors = ['#DCD8D0', '#EAE6DF', '#F1EEE8', '#FDECE0', '#E2F3E9', '#E6F0FC'];
  document.getElementById(targetEl).innerHTML = stocks.sort((a, b) => (a.AvailableQty || 0) - (b.AvailableQty || 0)).map((s, i) => {
    const avail = s.AvailableQty || 0, max = s.MaxQty || 1, pct = avail / max;
    const col = pct <= 0.3 ? 'var(--accent)' : 'var(--teal)';
    const icon = CATICONS[s.Category] || '📦';
    return `<div>
      <div class="st-row">
        <div class="st-prod"><div class="st-img" style="background:${colors[i % 6]}">${icon}</div><div class="st-name">${s.ProductName}</div></div>
        <div><div class="st-cat">${s.Category || 'GENERAL'}</div></div>
        <div><div class="sl-val">${avail}/${max} UNITS</div><div class="sl-bar-w"><div class="sl-bar" style="width:${Math.round(pct * 100)}%;background:${col}"></div></div></div>
        <div><button class="btn-update" onclick="toggleEdit('${s.id}','${s.ProductName}',${avail},${max})">Update</button></div>
      </div>
      <div class="inline-edit" id="ie-${s.id}">
        <div class="ie-grid">
          <div class="ie-f"><label class="ie-l">Available Qty</label><input class="ie-i" type="number" id="ie-avail-${s.id}" value="${avail}"></div>
          <div class="ie-f"><label class="ie-l">Max Capacity</label><input class="ie-i" type="number" id="ie-max-${s.id}" value="${max}"></div>
        </div>
        <div class="ie-acts">
          <button class="ie-btn ie-btn-cancel" onclick="toggleEdit('${s.id}')">Cancel</button>
          <button class="ie-btn ie-btn-save" id="ie-save-${s.id}" onclick="saveEdit('${s.id}')">Save Changes</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderStockView() {
  makeStockRows(cachedStocks.filter(s => s.ProductName), 'stock-tbody');
}

function renderInventoryView() {
  const stocks = cachedStocks.filter(s => s.ProductName);
  const low = stocks.filter(s => s.MaxQty && (s.AvailableQty || 0) / s.MaxQty <= 0.3).length;
  const val = stocks.reduce((s, x) => (parseFloat(x.Price) || 0) * (parseInt(x.MaxQty) || 0) + s, 0);
  document.getElementById('inv-total').textContent = stocks.length;
  document.getElementById('inv-low').textContent = low;
  document.getElementById('inv-value').textContent = '₹' + val.toLocaleString('en-IN');
  makeStockRows(stocks, 'inv-tbody');
}

function toggleEdit(id, name, avail, max, price) {
  // Close all others
  document.querySelectorAll('.inline-edit').forEach(el => { if (el.id !== 'ie-' + id) el.classList.remove('show'); });
  const el = document.getElementById('ie-' + id);
  el.classList.toggle('show');
}

async function saveEdit(id) {
  const avail = parseInt(document.getElementById('ie-avail-' + id).value);
  const max = parseInt(document.getElementById('ie-max-' + id).value);
  const btn = document.getElementById('ie-save-' + id);
  btn.textContent = 'Saving...';
  btn.disabled = true;
  try {
    await patchRecord(STOCK, id, { AvailableQty: avail, MaxQty: max });
    toast('✅ Stock updated and synced to Airtable!');
    document.getElementById('ie-' + id).classList.remove('show');
    await reloadStock();
  } catch (e) {
    toast('Failed to update: ' + e.message, 'error');
    btn.textContent = 'Save Changes';
    btn.disabled = false;
  }
}

// Add Item Modal
function showAddModal() {
  document.getElementById('add-modal').classList.add('show');
}

function hideAddModal() {
  document.getElementById('add-modal').classList.remove('show');
}

async function addNewItem() {
  const name = document.getElementById('new-name').value.trim();
  const cat = document.getElementById('new-cat').value;
  const qty = parseInt(document.getElementById('new-qty').value) || 0;
  const max = parseInt(document.getElementById('new-max').value) || 10;
  if (!name) {
    toast('Please enter a product name', 'error');
    return;
  }
  try {
    await createRecord(STOCK, { ProductName: name, Category: cat, AvailableQty: qty, MaxQty: max, IsAvailable: true });
    toast('✅ ' + name + ' added to Airtable!');
    hideAddModal();
    ['new-name', 'new-qty', 'new-max'].forEach(id => document.getElementById(id).value = '');
    await reloadStock();
  } catch (e) {
    toast('Failed to add: ' + e.message, 'error');
  }
}

function exportCSV() {
  const stocks = cachedStocks.filter(s => s.ProductName);
  const rows = [['Product', 'Category', 'Available', 'Max']];
  stocks.forEach(s => rows.push([s.ProductName, s.Category || '', s.AvailableQty || 0, s.MaxQty || 0]));
  const csv = rows.map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'stock.csv';
  a.click();
  toast('✅ CSV exported!');
}