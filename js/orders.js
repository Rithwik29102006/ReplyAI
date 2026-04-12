// Order management functions

let ordersLoaded = false;

async function renderOrdersView() {
  if (ordersLoaded && cachedOrders.length > 0) {
    renderOrdersTable();
    return;
  }

  document.getElementById('orders-tbody').innerHTML =
    '<tr><td colspan="9" style="text-align:center;padding:32px"><div style="display:flex;flex-direction:column;align-items:center;gap:12px"><div class="spinner"></div><span style="font-size:13px;color:var(--text-muted)">Loading orders...</span></div></td></tr>';

  try {
    const or = await Promise.race([
      fetchAll(ORDERS),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
    ]).catch(() => []);

    cachedOrders = or.map(r => ({ id: r.id, ...r.fields }));
    ordersLoaded = true;
    
    // If still empty, show demo orders
    if (cachedOrders.length === 0) {
      cachedOrders = [
        { id: 'demo1', OrderID: 'ORD-001', CustomerName: 'Priya Sharma', CakeType: 'Chocolate Cake', TotalPrice: '450', DeliveryDate: new Date().toISOString(), OrderStatus: 'Received', PaymentStatus: 'Pending' },
        { id: 'demo2', OrderID: 'ORD-002', CustomerName: 'Amit Kumar', CakeType: 'Red Velvet', TotalPrice: '550', DeliveryDate: new Date(Date.now() + 86400000).toISOString(), OrderStatus: 'Confirmed', PaymentStatus: 'Paid' },
        { id: 'demo3', OrderID: 'ORD-003', CustomerName: 'Sarah Jones', CakeType: 'Vanilla Cupcakes (6 pcs)', TotalPrice: '300', DeliveryDate: new Date(Date.now() + 172800000).toISOString(), OrderStatus: 'Baking', PaymentStatus: 'Paid' }
      ];
      ordersLoaded = true;
    }
    
    renderOrdersTable();

  } catch (e) {
    console.error('Orders failed:', e);
    // Show demo data on error
    cachedOrders = [
      { id: 'demo1', OrderID: 'ORD-001', CustomerName: 'Priya Sharma', CakeType: 'Chocolate Cake', TotalPrice: '450', DeliveryDate: new Date().toISOString(), OrderStatus: 'Received', PaymentStatus: 'Pending' },
      { id: 'demo2', OrderID: 'ORD-002', CustomerName: 'Amit Kumar', CakeType: 'Red Velvet', TotalPrice: '550', DeliveryDate: new Date(Date.now() + 86400000).toISOString(), OrderStatus: 'Confirmed', PaymentStatus: 'Paid' }
    ];
    ordersLoaded = true;
    renderOrdersTable();
  }
}

function renderOrdersTable() {
  const o = cachedOrders;

  document.getElementById('om-total').textContent = o.length || '0';
  document.getElementById('om-pending').textContent = o.filter(x => ['Received','Confirmed'].includes(x.OrderStatus)).length || '0';
  document.getElementById('om-baking').textContent = o.filter(x => x.OrderStatus === 'Baking').length || '0';
  document.getElementById('om-delivered').textContent = o.filter(x => x.OrderStatus === 'Delivered').length || '0';

  if (!o.length) {
    document.getElementById('orders-tbody').innerHTML =
      '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted);font-size:14px">🎂 No orders yet</td></tr>';
    return;
  }

  const SC = { Received:'#4285F4', Confirmed:'#FB8C00', Baking:'#F59E0B', 'Out for Delivery':'#197280', Delivered:'#208754', Cancelled:'#EA4335' };
  const PC = { Pending:'#FB8C00', Paid:'#208754', Refunded:'#EA4335' };

  document.getElementById('orders-tbody').innerHTML = o.map(x => {
    const sc = SC[x.OrderStatus] || '#888';
    const pc = PC[x.PaymentStatus] || '#888';
    const name = (x.CustomerName || 'Guest').replace(/^=/, '').trim();
    return `<tr>
      <td style="font-weight:600;font-size:12px">${x.OrderID || x.id.slice(0, 8)}</td>
      <td><div class="customer-cell"><div class="c-avatar">${name.slice(0, 2).toUpperCase()}</div><div class="c-name">${name}</div></div></td>
      <td><i class="ri-${x.Platform === 'Instagram' ? 'instagram-fill plat-icon ig' : 'whatsapp-fill plat-icon wa'}"></i></td>
      <td>${x.CakeType || '—'}</td>
      <td style="font-weight:700;color:var(--accent)">₹${parseInt(x.TotalPrice || 0).toLocaleString('en-IN')}</td>
      <td>${x.DeliveryDate ? new Date(x.DeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
      <td><span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;background:${sc}20;color:${sc}">${x.OrderStatus || 'Received'}</span></td>
      <td><span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;background:${pc}20;color:${pc}">${x.PaymentStatus || 'Pending'}</span></td>
      <td><button class="btn-update" onclick="toggleOrderEdit('${x.id}')">Update</button></td>
    </tr>
    <tr><td colspan="9" style="padding:0"><div class="inline-edit" id="oe-${x.id}"><div class="ie-grid"><div class="ie-f"><label class="ie-l">Order Status</label><select class="ie-i" id="oe-status-${x.id}"><option>Received</option><option>Confirmed</option><option>Baking</option><option>Out for Delivery</option><option>Delivered</option><option>Cancelled</option></select></div></div><div class="ie-acts"><button class="ie-btn ie-btn-cancel" onclick="toggleOrderEdit('${x.id}')">Cancel</button><button class="ie-btn ie-btn-save" onclick="saveOrderEdit('${x.id}')">Save</button></div></div></td></tr>`;
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
      await sendWhatsApp(phone, '✅ *Order Confirmed!*\n\n🆔 Order ID: ' + orderID + '\n🎂 Cake: ' + (order?.CakeType || '') + '\n📅 Delivery: ' + deliveryDate + '\n💰 Total: ₹' + (order?.TotalPrice || '') + '\n\nWe will start baking soon! Thank you for choosing Priya\'s Home Bakery 🙏');
      toast('✅ Order confirmed & customer notified on WhatsApp!');
    } else if (status === 'Out for Delivery') {
      await sendWhatsApp(phone, '🚚 *Your order is on the way!*\n\n🆔 Order ID: ' + orderID + '\n📍 Expected delivery in 30-45 minutes\n🎂 ' + (order?.CakeType || 'Your cake') + ' is on its way!\n\nPlease keep your phone handy. Thank you! 🍰');
      toast('✅ Out for delivery — customer notified!');
    } else if (status === 'Delivered') {
      await sendWhatsApp(phone, '🎉 *Order Delivered Successfully!*\n\n🆔 Order ID: ' + orderID + '\nYour cake has been delivered! We hope you love it 😍\n\nPlease share your feedback — it means a lot to us!\nThank you for choosing Priya\'s Home Bakery 🎂🙏');
      toast('✅ Delivered — customer notified!');
    } else {
      toast('✅ Order status updated!');
    }
    document.getElementById('oe-' + id).classList.remove('show');
    ordersLoaded = false;
    await renderOrdersView();
  } catch (e) {
    toast('Failed to update: ' + e.message, 'error');
    btn.textContent = 'Save';
    btn.disabled = false;
  }
}