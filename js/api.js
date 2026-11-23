// Airtable fetch/patch/create functions

// Fetch with timeout wrapper
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') {
      throw new Error('Request timed out after ' + timeoutMs + 'ms');
    }
    throw e;
  }
}

// Fetch all records from a table with pagination
async function fetchAll(tableId) {
  if (!tableId || tableId === 'tblYYYYY') return [];
  let records = [], offset = null;
  do {
    const url = `${AIRTABLE_PROXY}?table=${tableId}${offset ? '&offset=' + encodeURIComponent(offset) : ''}`;
    const res = await fetchWithTimeout(url, { headers: H }, 8000);
    if (!res.ok) throw new Error('API ' + res.status);
    const data = await res.json();
    records = records.concat(data.records || []);
    offset = data.offset || null;
  } while (offset);
  return records;
}

// Patch a record
async function patchRecord(tableId, id, fields) {
  const res = await fetch(`${AIRTABLE_PROXY}?table=${tableId}&id=${id}`, {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify({ fields })
  });
  if (!res.ok) throw new Error('Patch ' + res.status);
  return res.json();
}

// Create a new record
async function createRecord(tableId, fields) {
  const res = await fetch(`${AIRTABLE_PROXY}?table=${tableId}`, {
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

// Load all data (except orders - loaded separately)
async function loadData() {
  try {
    const [cr, sr] = await Promise.all([
      fetchAll(CONV).catch(() => []),
      fetchAll(STOCK).catch(() => [])
    ]);
    cachedConvs = cr.map(r => ({ id: r.id, ...r.fields }));
    cachedStocks = sr.map(r => ({ id: r.id, ...r.fields }));
    document.getElementById('last-updated').textContent = 'Updated ' + new Date().toLocaleTimeString();
    renderDashboard();
    renderAnalyticsView();
    renderStockView();
  } catch (e) {
    console.error('Load error:', e);
    document.getElementById('last-updated').textContent = 'Error — check connection';
  }
}

// Send WhatsApp message
// Live WhatsApp sending (Twilio via n8n) is turned off in this demo deployment.
// Order status changes still update Airtable; the message is only logged.
async function sendWhatsApp(phone, message) {
  if (!phone) return;
  console.log('[demo] WhatsApp message not sent (live sending disabled):', phone, message);
}
