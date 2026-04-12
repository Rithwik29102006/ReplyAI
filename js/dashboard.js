// Utility functions and Dashboard rendering

function toast(msg, type = 'success') {
  const t = document.getElementById('global-toast');
  t.textContent = msg;
  t.className = 'global-toast show' + (type === 'error' ? ' error' : '');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function clean(name) {
  if (!name) return 'Guest';
  return name.toString().replace(/^=/, '').trim() || 'Guest';
}

function timeAgo(ts) {
  if (!ts) return '';
  const d = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (d < 60) return d + 's ago';
  if (d < 3600) return Math.floor(d / 60) + 'm ago';
  if (d < 86400) return Math.floor(d / 3600) + 'h ago';
  return new Date(ts).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// Navigation
function switchView(v) {
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  document.getElementById('nav-' + v).classList.add('active');
  if (v === 'analytics') setTimeout(renderAnalyticsView, 100);
  if (v === 'stock') renderStockView();
  if (v === 'orders-mgmt') setTimeout(() => renderOrdersView(), 100);
  if (v === 'delivery') setTimeout(() => renderDeliveryView(), 100);
}

function sideNav(view, el) {
  document.querySelectorAll('.side-menu li').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
  el.querySelector('span') ? el.querySelector('span').style.color = 'var(--accent)' : null;
  currentSideView = view;
  // Show correct view
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (view === 'orders') {
    document.getElementById('view-dashboard').classList.add('active');
    document.getElementById('nav-dashboard').classList.add('active');
  } else if (view === 'settings') {
    document.getElementById('view-settings').classList.add('active');
    loadSettings();
  } else if (view === 'simulator') {
    document.getElementById('view-simulator').classList.add('active');
  } else {
    document.getElementById('view-' + view).classList.add('active');
  }
  if (view === 'ingredients') renderIngredients();
  if (view === 'inventory') renderInventoryView();
  if (view === 'marketing') renderMarketing();
  if (view === 'customers') renderCustomers();
  if (view === 'orders-mgmt') setTimeout(() => renderOrdersView(), 100);
  if (view === 'delivery') setTimeout(() => renderDeliveryView(), 100);
}

// DASHBOARD
function renderDashboard() {
  const c = cachedConvs;
  const total = c.length;
  const resolved = c.filter(x => x.Status === 'Resolved').length;
  const revenue = c.reduce((s, x) => s + (parseFloat(x.OrderValue) || 0), 0);
  const scores = c.map(x => parseInt(x.LeadScore) || 0).filter(s => s > 0);
  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
  const pct = total ? Math.round(resolved / total * 100) : 0;

  document.getElementById('m-total').innerHTML = `${total} <span class="m-sub c-green">messages</span>`;
  document.getElementById('m-resolved').innerHTML = `${pct}% <span class="m-sub c-green">automated</span>`;
  document.getElementById('m-revenue').innerHTML = `₹${revenue.toLocaleString()} <span class="m-sub c-red" style="font-size:11px">Pipeline</span>`;
  document.getElementById('m-score').innerHTML = `${avg} <span class="m-sub" style="color:var(--text-muted);font-size:14px;font-weight:500">/ 10</span>`;

  // Sentiment
  const sc = { Happy: 0, Neutral: 0, Frustrated: 0, Urgent: 0 };
  c.forEach(x => { if (x.Sentiment && sc[x.Sentiment] !== undefined) sc[x.Sentiment]++; });
  const tot = Object.values(sc).reduce((a, b) => a + b, 0) || 1;
  const maxS = Math.max(1, ...Object.values(sc));
  const sConf = [
    { k: 'Happy', pc: 'bg-green-l', bc: 'bg-green' },
    { k: 'Neutral', pc: 'bg-blue-l', bc: 'bg-blue' },
    { k: 'Frustrated', pc: 'bg-oran-l', bc: 'bg-oran' },
    { k: 'Urgent', pc: 'bg-red-l', bc: 'bg-red' }
  ];
  document.getElementById('sentiment-list').innerHTML = sConf.map(s => `
    <div class="sent-row">
      <div class="sent-pill ${s.pc}">${s.k.toUpperCase()}</div>
      <div class="sent-bar-w"><div class="sent-bar ${s.bc}" style="width:${Math.round(sc[s.k] / maxS * 100)}%"></div></div>
      <div class="sent-pct">${Math.round(sc[s.k] / tot * 100)}%</div>
    </div>`).join('');

  // Actions
  const acts = c.filter(x => x.Status === 'Escalated' || x.Sentiment === 'Frustrated' || (parseInt(x.LeadScore) || 0) >= 8).slice(0, 3);
  document.getElementById('action-list').innerHTML = acts.length ? acts.map(x => {
    const hot = (parseInt(x.LeadScore) || 0) >= 8;
    const frust = x.Sentiment === 'Frustrated';
    const cls = frust ? 'red' : 'teal';
    return `<div class="alert-box ${cls}">
      <i class="${frust ? 'ri-error-warning-fill' : 'ri-fire-fill'} alert-icon"></i>
      <div class="alert-cont">
        <h4>${hot ? '🔥 Hot Lead: ' : frust ? '😤 Frustrated: ' : `Alert: `}${clean(x.CustomerName)}</h4>
        <p>${(x.Message || 'No message').slice(0, 70)}</p>
        <div class="alert-acts"><button class="btn-sm btn-${cls === 'red' ? 'red' : 'teal'}">TAKE OVER</button><button class="btn-sm btn-wht">DISMISS</button></div>
      </div>
    </div>`;
  }).join('') : '<div style="text-align:center;padding:20px;color:var(--text-muted)">✅ All clear!</div>';

  // Messages table
  allMsgs = [...c].sort((a, b) => new Date(b.Timestamp || 0) - new Date(a.Timestamp || 0));
  dispCount = 10;
  renderMsgTable();
}

function renderMsgTable() {
  let msgs = allMsgs;
  if (msgFilter === 'unresolved') msgs = msgs.filter(c => c.Status !== 'Resolved');
  if (msgFilter === 'escalated') msgs = msgs.filter(c => c.Status === 'Escalated');
  const shown = msgs.slice(0, dispCount);
  const sentMap = { Happy: 'bg-green-l', Neutral: 'bg-blue-l', Frustrated: 'bg-oran-l', Urgent: 'bg-red-l' };
  if (!shown.length) {
    document.getElementById('msg-tbody').innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted)">No messages yet — send a WhatsApp to test!</td></tr>`;
    document.getElementById('load-more').style.display = 'none';
    return;
  }
  document.getElementById('msg-tbody').innerHTML = shown.map(c => {
    const name = clean(c.CustomerName);
    const ini = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const hot = (parseInt(c.LeadScore) || 0) >= 8;
    const sc = sentMap[c.Sentiment] || 'bg-blue-l';
    return `<tr style="${hot ? 'border-left:3px solid var(--accent)' : ''}">
      <td><div class="customer-cell"><div class="c-avatar">${ini}</div><div class="c-name">${name}${hot ? ' 🔥' : ''}</div></div></td>
      <td><i class="ri-${c.Platform === 'Instagram' ? 'instagram-fill plat-icon ig' : 'whatsapp-fill plat-icon wa'}"></i></td>
      <td><div class="msg-txt">"${(c.Message || '—').slice(0, 40)}..."</div></td>
      <td><div class="rep-txt">${c.ReplySent ? '"' + c.ReplySent.slice(0, 35) + '..."' : '—'}</div></td>
      <td><span class="pill-sm">${c.Intent || '—'}</span></td>
      <td><div class="sent-pill ${sc}" style="margin:0;width:auto;padding:3px 8px">${c.Sentiment || '—'}</div></td>
      <td><span class="score-txt">${parseInt(c.LeadScore) || '—'}</span></td>
    </tr>`;
  }).join('');
  document.getElementById('load-more').style.display = msgs.length > dispCount ? 'block' : 'none';
}

function filterMsg(f, el) {
  msgFilter = f;
  dispCount = 10;
  document.querySelectorAll('.f-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderMsgTable();
}

function loadMore() {
  dispCount += 10;
  renderMsgTable();
}

function showAllAlerts() {
  const acts = cachedConvs.filter(x => x.Status === 'Escalated' || x.Sentiment === 'Frustrated' || (parseInt(x.LeadScore) || 0) >= 8);
  const content = acts.length ? acts.map(x => `<div style="padding:12px;border-bottom:1px solid var(--border)"><strong>${clean(x.CustomerName)}</strong> — ${x.Intent || '—'} — ${x.Sentiment || '—'} — Score: ${parseInt(x.LeadScore) || 0}<br><span style="font-size:12px;color:var(--text-muted)">${(x.Message || '').slice(0, 80)}</span></div>`).join('') : '<p style="color:var(--text-muted);padding:16px">No alerts at this time!</p>';
  document.getElementById('restock-content').innerHTML = `<h3 style="margin-bottom:12px;font-size:15px">All Action Items (${acts.length})</h3>` + content;
  document.getElementById('restock-modal').classList.add('show');
}