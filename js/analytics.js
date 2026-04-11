// Analytics chart rendering functions

function renderAnalyticsView() {
  const c = cachedConvs;

  // STAT CARDS
  const total = c.length;
  const resolved = c.filter(x => x.Status === 'Resolved').length;
  const resolutionPct = total ? Math.round(resolved / total * 100) : 0;

  // Top Intent
  const ic = {};
  c.forEach(x => { if (x.Intent) ic[x.Intent] = (ic[x.Intent] || 0) + 1; });
  const topIntent = Object.entries(ic).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  // Revenue
  const revenue = c.reduce((s, x) => s + (parseFloat(x.OrderValue) || 0), 0);

  document.getElementById('stat-conversations').innerHTML = total +
    '<span class="m-sub" style="font-size:11px;color:var(--text-muted)">total</span>';
  document.getElementById('stat-resolution').innerHTML = resolutionPct + '%' +
    '<span class="m-sub c-green" style="font-size:11px">resolved</span>';
  document.getElementById('stat-top-intent').innerHTML = topIntent +
    '<span class="m-sub" style="font-size:11px;color:var(--text-muted)">top</span>';
  document.getElementById('stat-revenue').innerHTML = '₹' + revenue.toLocaleString('en-IN') +
    '<span class="m-sub c-red" style="font-size:11px">pipeline</span>';

  // Render all charts
  if (document.getElementById('view-analytics').classList.contains('active')) {
    renderIntentChart();
    renderSentimentChart();
    renderLeadScoreChart();
    renderVolumeChart();
  }
}

function renderIntentChart() {
  const ctx = document.getElementById('intentChart');
  if (!ctx) return;
  if (intentChartI) intentChartI.destroy();

  const ic = {};
  cachedConvs.forEach(x => { if (x.Intent) ic[x.Intent] = (ic[x.Intent] || 0) + 1; });
  const intents = ['PRICE', 'ORDER', 'CUSTOMIZATION', 'DELIVERY', 'AVAILABILITY', 'SUPPORT'];
  const data = intents.map(i => ic[i] || 0);

  intentChartI = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: intents,
      datasets: [{
        data: data,
        backgroundColor: intents.map(i => ICOLORS[i] || '#888'),
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, beginAtZero: true },
        y: { grid: { display: false } }
      }
    }
  });
}

function renderSentimentChart() {
  const ctx = document.getElementById('sentimentChart');
  if (!ctx) return;
  if (sentimentChartI) sentimentChartI.destroy();

  const sc = { Happy: 0, Neutral: 0, Frustrated: 0, Urgent: 0 };
  cachedConvs.forEach(x => { if (x.Sentiment && sc[x.Sentiment] !== undefined) sc[x.Sentiment]++; });
  const data = [sc.Happy, sc.Neutral, sc.Frustrated, sc.Urgent];

  sentimentChartI = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Happy', 'Neutral', 'Frustrated', 'Urgent'],
      datasets: [{
        data: data,
        backgroundColor: ['#208754', '#4285F4', '#FB8C00', '#EA4335'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' } }
      }
    }
  });
}

function renderLeadScoreChart() {
  const ctx = document.getElementById('leadScoreChart');
  if (!ctx) return;
  if (leadScoreChartI) leadScoreChartI.destroy();

  const buckets = { Low: 0, Medium: 0, High: 0, Hot: 0 };
  cachedConvs.forEach(x => {
    const s = parseInt(x.LeadScore) || 0;
    if (s >= 1 && s <= 3) buckets.Low++;
    else if (s >= 4 && s <= 6) buckets.Medium++;
    else if (s >= 7 && s <= 8) buckets.High++;
    else if (s >= 9 && s <= 10) buckets.Hot++;
  });
  const data = [buckets.Low, buckets.Medium, buckets.High, buckets.Hot];

  leadScoreChartI = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Low (1-3)', 'Medium (4-6)', 'High (7-8)', 'Hot (9-10)'],
      datasets: [{
        data: data,
        backgroundColor: ['#888780', '#FB8C00', '#B23D22', '#EA4335'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { display: false } }
      }
    },
    plugins: [{
      afterDatasetsDraw: (chart) => {
        const ctx = chart.ctx;
        chart.data.datasets[0].data.forEach((val, i) => {
          const meta = chart.getDatasetMeta(0);
          const pos = meta.data[i].y;
          ctx.fillStyle = '#2B2523';
          ctx.font = '12px DM Sans';
          ctx.textAlign = 'center';
          ctx.fillText(val, meta.data[i].x, pos - 5);
        });
      }
    }]
  });
}

function renderVolumeChart() {
  const ctx = document.getElementById('volumeChart');
  if (!ctx) return;
  if (volumeChartI) volumeChartI.destroy();

  // Group by date - last 10 days
  const dateCounts = {};
  const now = new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    dateCounts[key] = 0;
  }
  cachedConvs.forEach(x => {
    if (x.Timestamp) {
      const d = new Date(x.Timestamp);
      const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      if (dateCounts[key] !== undefined) dateCounts[key]++;
    }
  });
  const labels = Object.keys(dateCounts);
  const data = Object.values(dateCounts);

  volumeChartI = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        borderColor: '#B23D22',
        backgroundColor: 'rgba(178,61,34,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#B23D22'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { display: false } }
      }
    }
  });
}