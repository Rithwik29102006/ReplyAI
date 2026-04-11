// Delivery tracking functions

function renderDeliveryView() {
  const d = cachedDeliveries;
  const today = new Date().toISOString().split('T')[0];
  const scheduled = d.filter(x => x.DeliveryDate && x.DeliveryDate.split('T')[0] === today).length;
  const ontheway = d.filter(x => x.DeliveryStatus === 'Out for Delivery').length;
  const deliveredToday = d.filter(x => x.DeliveryDate && x.DeliveryDate.split('T')[0] === today && x.DeliveryStatus === 'Delivered').length;

  document.getElementById('dt-scheduled').innerHTML = scheduled + '<span class="m-sub" style="font-size:11px;color:var(--text-muted)">today</span>';
  document.getElementById('dt-ontheway').innerHTML = ontheway + '<span class="m-sub c-red" style="font-size:11px">active</span>';
  document.getElementById('dt-delivered').innerHTML = deliveredToday + '<span class="m-sub c-green" style="font-size:11px">today</span>';

  if (!d.length) {
    document.getElementById('delivery-tbody').innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-muted)">No deliveries found</td></tr>';
    return;
  }
  document.getElementById('delivery-tbody').innerHTML = d.map(x => {
    const statusColor = DELIVERY_STATUS_COLORS[x.DeliveryStatus] || '#888';
    return `<tr>
      <td style="font-weight:600">${x.OrderID || '—'}</td>
      <td>${x.CustomerName || 'Guest'}</td>
      <td>${x.Phone || '—'}</td>
      <td style="max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x.DeliveryAddress || '—'}</td>
      <td>${x.DeliveryDate ? new Date(x.DeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
      <td><span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;background:${statusColor}20;color:${statusColor}">${x.DeliveryStatus || 'Scheduled'}</span></td>
      <td>${x.EstimatedTime || '—'}</td>
      <td>${x.DriverName || '—'}</td>
      <td><button class="btn-update" onclick="toggleDeliveryEdit('${x.id}')">Update</button></td>
    </tr><tr><td colspan="9" style="padding:0"><div class="inline-edit" id="de-${x.id}"><div class="ie-grid"><div class="ie-f"><label class="ie-l">Delivery Status</label><select class="ie-i" id="de-status-${x.id}"><option>Scheduled</option><option>Out for Delivery</option><option>Delivered</option><option>Failed</option></select></div><div class="ie-f"><label class="ie-l">Driver Name</label><input class="ie-i" id="de-driver-${x.id}" value="${x.DriverName || ''}"></div><div class="ie-f"><label class="ie-l">ETA</label><input class="ie-i" id="de-eta-${x.id}" value="${x.EstimatedTime || ''}"></div></div><div class="ie-acts"><button class="ie-btn ie-btn-cancel" onclick="toggleDeliveryEdit('${x.id}')">Cancel</button><button class="ie-btn ie-btn-save" onclick="saveDeliveryEdit('${x.id}')">Save</button></div></div></td></tr>`;
  }).join('');
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