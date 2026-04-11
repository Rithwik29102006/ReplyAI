// Customer view functions

let allCusts = [];

function renderCustomers() {
  allCusts = [...cachedConvs].sort((a, b) => (parseInt(b.LeadScore) || 0) - (parseInt(a.LeadScore) || 0));
  renderCustTable(allCusts);
}

function filterCustomers(q) {
  const filtered = allCusts.filter(c => clean(c.CustomerName).toLowerCase().includes(q.toLowerCase()) || (c.Message || '').toLowerCase().includes(q.toLowerCase()));
  renderCustTable(filtered);
}

function renderCustTable(data) {
  const sentMap = { Happy: 'bg-green-l', Neutral: 'bg-blue-l', Frustrated: 'bg-oran-l', Urgent: 'bg-red-l' };
  document.getElementById('cust-tbody').innerHTML = data.length ? data.map(c => {
    const hot = (parseInt(c.LeadScore) || 0) >= 8;
    const frust = c.Sentiment === 'Frustrated';
    const sc = sentMap[c.Sentiment] || 'bg-blue-l';
    return `<tr style="${hot ? 'background:#FFF8F8' : frust ? 'background:#FFFBF5' : ''}">
      <td style="font-weight:600">${clean(c.CustomerName)}${hot ? ' 🔥' : ''}</td>
      <td><i class="ri-${c.Platform === 'Instagram' ? 'instagram-fill plat-icon ig' : 'whatsapp-fill plat-icon wa'}"></i></td>
      <td style="font-size:12px;color:var(--text-muted);max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${(c.Message || '—').slice(0, 40)}</td>
      <td><span class="pill-sm">${c.Intent || '—'}</span></td>
      <td style="font-weight:600">${parseInt(c.LeadScore) || '—'}</td>
      <td><div class="sent-pill ${sc}" style="margin:0;width:auto;padding:3px 8px">${c.Sentiment || '—'}</div></td>
      <td><span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;background:${c.Status === 'Resolved' ? '#E2F3E9' : c.Status === 'Escalated' ? '#FCE8E6' : '#FAEEDA'};color:${c.Status === 'Resolved' ? 'var(--green)' : c.Status === 'Escalated' ? '#C5221F' : '#B95000'}">${c.Status || 'New'}</span></td>
      <td style="font-size:12px;color:var(--text-muted)">${timeAgo(c.Timestamp)}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted)">No customers found</td></tr>';
}

function exportConvsCSV() {
  const rows = [['Name', 'Platform', 'Message', 'Intent', 'LeadScore', 'Sentiment', 'Status', 'Time']];
  cachedConvs.forEach(c => rows.push([clean(c.CustomerName), c.Platform || '', c.Message || '', c.Intent || '', parseInt(c.LeadScore) || 0, c.Sentiment || '', c.Status || '', c.Timestamp || '']));
  const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'customers.csv';
  a.click();
  toast('✅ Customers exported!');
}