// Airtable fetch/patch/create functions

// Fetch all records from a table with pagination
async function fetchAll(tableId) {
  let records = [], offset = null;
  do {
    const url = `https://api.airtable.com/v0/${BASE}/${tableId}?pageSize=100${offset ? '&offset=' + offset : ''}`;
    const res = await fetch(url, { headers: H });
    if (!res.ok) throw new Error('API ' + res.status);
    const data = await res.json();
    records = records.concat(data.records || []);
    offset = data.offset || null;
  } while (offset);
  return records;
}

// Patch a record
async function patchRecord(tableId, id, fields) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${tableId}/${id}`, {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify({ fields })
  });
  if (!res.ok) throw new Error('Patch ' + res.status);
  return res.json();
}

// Create a new record
async function createRecord(tableId, fields) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${tableId}`, {
    method: 'POST',
    headers: H,
    body: JSON.stringify({ records: [{ fields }] })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Create: ' + err);
  }
  return res.json();
}

// Reload stock data
async function reloadStock() {
  try {
    const sr = await fetchAll(STOCK);
    cachedStocks = sr.map(r => ({ id: r.id, ...r.fields }));
    renderStockView();
    renderInventoryView();
  } catch (e) {
    toast('Failed to reload stock', 'error');
  }
}

// Load all data
async function loadData() {
  try {
    const cr = await fetchAll(CONV).catch(() => []);
    const sr = await fetchAll(STOCK).catch(() => []);
    const or = await fetchAll(ORDERS).catch(() => []);
    cachedConvs = cr.map(r => ({ id: r.id, ...r.fields }));
    cachedStocks = sr.map(r => ({ id: r.id, ...r.fields }));
    cachedOrders = or.map(r => ({ id: r.id, ...r.fields }));
    cachedDeliveries = [];
    document.getElementById('last-updated').textContent = 'Updated ' + new Date().toLocaleTimeString();
    renderDashboard();
    renderAnalyticsView();
    renderStockView();
  } catch (e) {
    document.getElementById('last-updated').textContent = 'Error — check connection';
    console.error(e);
  }
}

// Send WhatsApp message
async function sendWhatsApp(phone, message) {
  if (!phone) return;
  const to = phone.startsWith('whatsapp:') ? phone : 'whatsapp:+91' + phone.replace(/\D/g, '');
  try {
    const res = await fetch('https://rithwikreddy.app.n8n.cloud/webhook/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: to, message: message })
    });
    console.log('WhatsApp sent:', res.status);
  } catch (e) {
    console.error('WhatsApp failed:', e);
  }
}