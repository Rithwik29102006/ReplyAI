// Marketing functions

function renderMarketing() {
  const hot = cachedConvs.filter(c => (parseInt(c.LeadScore) || 0) >= 8).slice(0, 5);
  document.getElementById('hot-leads').innerHTML = hot.length ? hot.map(c => `
    <div class="lead-item">
      <div><div class="lead-name">${clean(c.CustomerName)}</div><div style="font-size:11px;color:var(--text-muted)">${c.Intent || '—'} • ${c.Platform || '—'}</div></div>
      <span class="lead-score">Score: ${parseInt(c.LeadScore) || 0}</span>
    </div>`).join('') : '<div style="color:var(--text-muted);font-size:13px;padding:16px">No hot leads yet — keep messaging!</div>';
  const followup = cachedConvs.filter(c => !c.FollowUpSent && (c.Intent === 'PRICE' || c.Intent === 'AVAILABILITY')).slice(0, 5);
  document.getElementById('followup-list').innerHTML = followup.length ? followup.map(c => `
    <div class="lead-item">
      <div><div class="lead-name">${clean(c.CustomerName)}</div><div style="font-size:11px;color:var(--text-muted)">${c.Intent} • ${timeAgo(c.Timestamp)}</div></div>
      <span style="font-size:11px;font-weight:600;color:var(--teal)">PENDING</span>
    </div>`).join('') : '<div style="color:var(--text-muted);font-size:13px;padding:16px">No follow-ups pending!</div>';
}

function copyTemplate(text) {
  navigator.clipboard.writeText(text).then(() => toast('✅ Template copied to clipboard!')).catch(() => toast('Copy failed', 'error'));
}