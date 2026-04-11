// Order management functions

function renderOrdersView() {
  const o = cachedOrders;
  const today = new Date().toISOString().split('T')[0];
  const total = o.length;
  const pending = o.filter(x => x.OrderStatus && ['Received', 'Confirmed'].includes(x.OrderStatus)).length;
  const baking = o.filter(x => x.OrderStatus === 'Baking').length;
  const delivered = o.filter(x => x.DeliveryDate && x.DeliveryDate.split('T')[0] === today && x.OrderStatus === 'Delivered').length;

  document.getElementById('om-total').innerHTML = total + '<span class="m-sub" style="font-size:11px;color:var(--text-muted)">orders</span>';
  document.getElementById('om-pending').innerHTML = pending + '<span class="m-sub c-red" style="font-size:11px">pending</span>';
  document.getElementById('om-baking').innerHTML = baking + '<span class="m-sub" style="color:#F59E0B;font-size:11px">baking</span>';
  document.getElementById('om-delivered').innerHTML = delivered + '<span class="m-sub c-green" style="font-size:11px">today</span>';

  if (!o.length) {
    document.getElementById('orders-tbody').innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-muted)">No orders found</td></tr>';
    return;
  }
  document.getElementById('orders-tbody').innerHTML = o.map(x => {
    const plat = x.Platform || '';
    const platIcon = plat === 'Instagram' ? '<i class="ri-instagram-fill plat-icon ig"></i>' : '<i class="ri-whatsapp-fill plat-icon wa"></i>';
    const statusColor = ORDER_STATUS_COLORS[x.OrderStatus] || '#888';
    const payColor = PAYMENT_COLORS[x.PaymentStatus] || '#888';
    return `<tr>
      <td style="font-weight:600">${x.OrderID || '—'}</td>
      <td><div class="customer-cell"><div class="c-avatar">${(x.CustomerName || 'G').slice(0, 2).toUpperCase()}</div><div class="c-name">${x.CustomerName || 'Guest'}</div></div></td>
      <td>${platIcon}</td>
      <td>${x.CakeType || '—'}${x.Size ? ' <span style="color:var(--text-muted)">(' + x.Size + ')</span>' : ''}</td>
      <td style="font-weight:700;color:var(--accent)">₹${parseInt(x.TotalPrice || 0).toLocaleString('en-IN')}</td>
      <td>${x.DeliveryDate ? new Date(x.DeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
      <td><span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;background:${statusColor}20;color:${statusColor}">${x.OrderStatus || 'Received'}</span></td>
      <td><span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;background:${payColor}20;color:${payColor}">${x.PaymentStatus || 'Pending'}</span></td>
      <td><button class="btn-update" onclick="toggleOrderEdit('${x.id}')">Update</button></td>
    </tr><tr><td colspan="9" style="padding:0"><div class="inline-edit" id="oe-${x.id}"><div class="ie-grid"><div class="ie-f"><label class="ie-l">Order Status</label><select class="ie-i" id="oe-status-${x.id}"><option>Received</option><option>Confirmed</option><option>Baking</option><option>Out for Delivery</option><option>Delivered</option><option>Cancelled</option></select></div></div><div class="ie-acts"><button class="ie-btn ie-btn-cancel" onclick="toggleOrderEdit('${x.id}')">Cancel</button><button class="ie-btn ie-btn-save" onclick="saveOrderEdit('${x.id}')">Save</button></div></div></td></tr>`;
  }).join('');
}

function toggleOrderEdit(id) {
  document.querySelectorAll('.inline-edit').forEach(el => { if (el.id !== 'oe-' + id) el.classList.remove('show'); });
  document.getElementById('oe-' + id).classList.toggle('show');
}

async function saveOrderEdit(id) {
  const status = document.getElementById('oe-status-' + id).value;
  const btn = document.querySelector('#oe-' + id + ' .ie-btn-save');
  btn.textContent = 'Saving...';
  btn.disabled = true;
  try {
    await patchRecord(ORDERS, id, { OrderStatus: status });
    const order = cachedOrders.find(o => o.id === id);
    const phone = order?.CustomerPhone || '';
    const orderID = order?.OrderID || id;
    const deliveryDate = order?.DeliveryDate ? new Date(order.DeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'scheduled date';

    if (status === 'Confirmed') {
      await sendWhatsApp(phone,
        '✅ *Order Confirmed!*\n\n' +
        '🆔 Order ID: ' + orderID + '\n' +
        '🎂 Cake: ' + (order?.CakeType || '') + '\n' +
        '📅 Delivery: ' + deliveryDate + '\n' +
        '💰 Total: ₹' + (order?.TotalPrice || '') + '\n\n' +
        'We will start baking soon! Thank you for choosing Priya\'s Home Bakery 🙏'
      );
      toast('✅ Order confirmed & customer notified on WhatsApp!');
    } else if (status === 'Out for Delivery') {
      await sendWhatsApp(phone,
        '🚚 *Your order is on the way!*\n\n' +
        '🆔 Order ID: ' + orderID + '\n' +
        '📍 Expected delivery in 30-45 minutes\n' +
        '🎂 ' + (order?.CakeType || 'Your cake') + ' is on its way!\n\n' +
        'Please keep your phone handy. Thank you! 🍰'
      );
      toast('✅ Out for delivery — customer notified!');
    } else if (status === 'Delivered') {
      await sendWhatsApp(phone,
        '🎉 *Order Delivered Successfully!*\n\n' +
        '🆔 Order ID: ' + orderID + '\n' +
        'Your cake has been delivered! We hope you love it 😍\n\n' +
        'Please share your feedback — it means a lot to us!\n' +
        'Thank you for choosing Priya\'s Home Bakery 🎂🙏'
      );
      toast('✅ Delivered — customer notified!');
    } else {
      toast('✅ Order status updated!');
    }
    document.getElementById('oe-' + id).classList.remove('show');
    await loadData();
  } catch (e) {
    toast('Failed to update: ' + e.message, 'error');
    btn.textContent = 'Save';
    btn.disabled = false;
  }
}