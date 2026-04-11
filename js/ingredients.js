// Ingredient tracking functions

function renderIngredients() {
  document.getElementById('ing-tbody').innerHTML = INGREDIENTS.map(i => `
    <tr>
      <td style="font-weight:600">${i.name}</td>
      <td style="color:var(--text-muted)">${i.usedIn}</td>
      <td><span class="status-pill ${i.status === 'In Stock' ? 'status-in' : 'status-low'}">${i.status.toUpperCase()}</span></td>
    </tr>`).join('');
}

function showRestockAlert() {
  const low = INGREDIENTS.filter(i => i.status === 'Low Stock');
  document.getElementById('restock-content').innerHTML = `
    <p style="margin-bottom:16px;color:var(--text-muted)">The following ingredients need to be restocked:</p>
    ${low.map(i => `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px">
      <div><strong>${i.name}</strong><div style="font-size:12px;color:var(--text-muted)">Used in: ${i.usedIn}</div></div>
      <span class="status-pill status-low">LOW STOCK</span>
    </div>`).join('')}
    <div style="margin-top:16px;padding:12px;background:#E2F3E9;border-radius:8px;font-size:13px;color:var(--green)">
      💡 Tip: Order at least 2kg of each low-stock ingredient to last the week.
    </div>`;
  document.getElementById('restock-modal').classList.add('show');
}