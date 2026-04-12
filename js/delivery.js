// Delivery tracking functions

async function renderDeliveryView() {
  try {
    document.getElementById('delivery-tbody').innerHTML = '<tr><td colspan="9"><div class="loading-wrap"><div class="spinner"></div></div></td></tr>';
    
    document.getElementById('dt-scheduled').textContent = '0';
    document.getElementById('dt-ontheway').textContent = '0';
    document.getElementById('dt-delivered').textContent = '0';
    
    document.getElementById('delivery-tbody').innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted);font-size:14px">🚚 No deliveries yet — delivery records will appear here automatically</td></tr>';
    
  } catch(e) {
    console.error('Delivery error:', e);
    document.getElementById('delivery-tbody').innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--accent)">Error loading deliveries.</td></tr>';
  }
}

function toggleDeliveryEdit(id) {
  document.querySelectorAll('.inline-edit').forEach(el => { if (el.id !== 'de-' + id) el.classList.remove('show'); });
  document.getElementById('de-' + id).classList.toggle('show');
}

async function saveDeliveryEdit(id) {
  const status = document.getElementById('de-status-' + id).value;
  const driver = document.getElementById('de-driver-' + id).value;
  const eta = document.getElementById('de-eta-' + id).value;
  const btn = document.querySelector('#de-' + id + ' .ie-btn-save');
  btn.textContent = 'Saving...';
  btn.disabled = true;
  try {
    await patchRecord(DELIVERY, id, { DeliveryStatus: status, DriverName: driver, EstimatedTime: eta });
    toast('✅ Delivery updated!');
    document.getElementById('de-' + id).classList.remove('show');
    await loadData();
  } catch (e) {
    toast('Failed to update: ' + e.message, 'error');
    btn.textContent = 'Save';
    btn.disabled = false;
  }
}