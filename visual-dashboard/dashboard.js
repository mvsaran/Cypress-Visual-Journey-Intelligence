/**
 * ============================================================
 * VISUAL DASHBOARD CONTROLLER
 * Cypress Visual Journey Intelligence
 * ============================================================
 *
 * Loads workflow-results.json and ai-analysis.json from the
 * /reports directory (served by a local file server), then
 * renders the full visual dashboard.
 *
 * For local dev without a server, we embed sample data.
 */

'use strict';

// ─── Data Sources ─────────────────────────────────────────
const RESULTS_PATH     = '../reports/workflow-results.json';
const AI_ANALYSIS_PATH = '../reports/ai-analysis.json';

// ─── Story Report Template ────────────────────────────────
function buildStoryReport(results, aiAnalysis) {
  const lines = [];
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('  🎭  VISUAL JOURNEY INTELLIGENCE — STORY MODE REPORT');
  lines.push('  Generated: ' + new Date().toLocaleString());
  lines.push('═══════════════════════════════════════════════════════════════\n');

  results.forEach(step => {
    if (step.status === 'passed') {
      lines.push(`${step.icon}  ${step.description || step.label}`);
      lines.push(`   ✅ Status: PASSED  |  ⏱️ Duration: ${(step.duration / 1000).toFixed(2)}s`);
    } else if (step.status === 'failed') {
      lines.push(`${step.icon}  ${step.description || step.label}`);
      lines.push('   ❌ Status: FAILED');

      const ai = (aiAnalysis || []).find(a => a.stepId === step.step);
      if (ai && ai.analysis) {
        lines.push('');
        lines.push('   🤖 AI FAILURE ANALYSIS:');
        lines.push('   ─────────────────────────────────────────────');
        lines.push(`   📋 Summary    : ${ai.analysis.failureSummary || '—'}`);
        lines.push(`   🔍 Root Cause : ${ai.analysis.likelyRootCause || '—'}`);
        lines.push(`   💼 Biz Impact : ${ai.analysis.businessImpact || '—'}`);
        lines.push(`   🔧 Fix        : ${ai.analysis.suggestedFix || '—'}`);
        lines.push(`   🎯 Better Sel : ${ai.analysis.betterSelectorRecommendation || '—'}`);
        lines.push(`   🐛 Bug?       : ${ai.analysis.possibleProductBug || '—'}`);
        lines.push(`   📊 Confidence : ${ai.analysis.confidenceScore || '—'}%`);
      } else {
        lines.push(`   ⚠️  Error: ${step.error || 'Unknown error'}`);
      }
    } else if (step.status === 'skipped') {
      lines.push(`${step.icon}  [SKIPPED] ${step.label} — Previous critical step failed`);
    }
    lines.push('');
  });

  const passed  = results.filter(r => r.status === 'passed').length;
  const failed  = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const totalMs = results.reduce((s, r) => s + (r.duration || 0), 0);

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('  📊 SUMMARY');
  lines.push(`  Total Steps  : ${results.length}`);
  lines.push(`  ✅ Passed    : ${passed}`);
  lines.push(`  ❌ Failed    : ${failed}`);
  lines.push(`  ⏭️  Skipped   : ${skipped}`);
  lines.push(`  ⏱️  Total Time: ${(totalMs / 1000).toFixed(2)}s`);
  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}

// ─── Risk Colour Helpers ──────────────────────────────────
function riskClass(risk) {
  return `risk-chip-${risk}`;
}

function heatClass(step) {
  if (step.status === 'failed') {
    const riskWeight = { low: 1, medium: 2, high: 3, critical: 3 };
    return `heat-${riskWeight[step.risk] || 1}`;
  }
  return 'heat-0';
}

// ─── Render Stats Bar ─────────────────────────────────────
function renderStats(results) {
  const total   = results.length;
  const passed  = results.filter(r => r.status === 'passed').length;
  const failed  = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const totalMs = results.reduce((s, r) => s + (r.duration || 0), 0);
  const pct     = total ? Math.round((passed / total) * 100) : 0;

  document.getElementById('stat-total-val').textContent  = total;
  document.getElementById('stat-passed-val').textContent = passed;
  document.getElementById('stat-failed-val').textContent = failed;
  document.getElementById('stat-skipped-val').textContent= skipped;
  document.getElementById('stat-time-val').textContent   = (totalMs / 1000).toFixed(1) + 's';
  document.getElementById('stat-score-val').textContent  = pct + '%';

  // Colour the pass rate
  const scoreEl = document.getElementById('stat-score-val');
  scoreEl.style.color = pct === 100 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#f43f5e';
}

// ─── Render Journey Flow ──────────────────────────────────
function renderJourneyFlow(results) {
  const container = document.getElementById('journey-flow');
  container.innerHTML = '';

  results.forEach((step, idx) => {
    const node = document.createElement('div');
    node.className = 'journey-step';
    node.setAttribute('role', 'listitem');

    node.innerHTML = `
      <div class="journey-node status-${step.status}" id="jnode-${step.step}"
           title="${step.label} — ${step.status.toUpperCase()}"
           tabindex="0" role="button" aria-label="${step.label}, status ${step.status}">
        <div class="journey-icon">${step.icon}</div>
        <div class="journey-label">${step.label}</div>
        <span class="journey-badge badge-${step.risk}">${step.risk}</span>
      </div>
    `;

    if (idx < results.length - 1) {
      const conn = document.createElement('div');
      conn.className = 'journey-connector';
      node.appendChild(conn);
    }

    // Click → scroll to step card
    node.querySelector('.journey-node').addEventListener('click', () => {
      const card = document.getElementById(`step-card-${step.step}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.outline = '2px solid var(--accent-primary)';
        setTimeout(() => card.style.outline = '', 1800);
      }
    });

    container.appendChild(node);
  });

  // Progress bar
  const passed = results.filter(r => r.status === 'passed').length;
  const pct    = results.length ? Math.round((passed / results.length) * 100) : 0;
  document.getElementById('progress-bar-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent    = `${pct}% complete (${passed}/${results.length} steps passed)`;
  document.getElementById('journey-meta').textContent      = `${results.length} steps · ${results.filter(r=>r.status==='failed').length} failed`;
}

// ─── Render Step Cards ─────────────────────────────────────
function renderStepCards(results, filter = 'all') {
  const grid = document.getElementById('steps-grid');
  grid.innerHTML = '';

  const filtered = filter === 'all' ? results : results.filter(r => r.status === filter);

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>No ${filter} steps to display.</p></div>`;
    return;
  }

  filtered.forEach(step => {
    const card = document.createElement('div');
    card.className = `step-card status-${step.status}`;
    card.id = `step-card-${step.step}`;
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${step.label} step, status ${step.status}`);

    const durationStr = step.duration ? (step.duration / 1000).toFixed(2) + 's' : '—';
    const urlStr = step.url ? new URL(step.url).pathname : '—';

    let errorHtml = '';
    if (step.status === 'failed' && step.error) {
      const shortErr = step.error.length > 140 ? step.error.substring(0, 140) + '…' : step.error;
      errorHtml = `<div class="step-error-preview" title="${step.error}">${shortErr}</div>`;
    }

    let screenshotHtml = '';
    if (step.screenshot) {
      screenshotHtml = `
        <a class="step-screenshot-link" role="button" tabindex="0"
           title="View screenshot: ${step.screenshot}">
          📸 View Screenshot
        </a>`;
    }

    card.innerHTML = `
      <div class="step-card-header">
        <div class="step-card-icon">${step.icon}</div>
        <div class="step-card-meta">
          <span class="step-status-pill pill-${step.status}">${step.status}</span>
          <span class="step-risk-chip ${riskClass(step.risk)}">${step.risk}</span>
        </div>
      </div>
      <div class="step-card-title">${step.label}</div>
      <div class="step-card-desc">${step.description || '—'}</div>
      <div class="step-card-stats">
        <div class="step-stat">
          <span class="step-stat-val">${durationStr}</span>
          <span class="step-stat-key">Duration</span>
        </div>
        <div class="step-stat">
          <span class="step-stat-val">${step.risk.toUpperCase()}</span>
          <span class="step-stat-key">Risk</span>
        </div>
        <div class="step-stat">
          <span class="step-stat-val" style="font-size:0.7rem;color:var(--text-muted)">${urlStr}</span>
          <span class="step-stat-key">Page</span>
        </div>
      </div>
      ${errorHtml}
      ${screenshotHtml}
    `;

    // Click → modal with full details
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('step-screenshot-link')) {
        openStepModal(step);
      }
    });

    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') openStepModal(step);
    });

    grid.appendChild(card);
  });
}

// ─── Render AI Analysis ────────────────────────────────────
function renderAiAnalysis(aiAnalysis, results) {
  if (!aiAnalysis || aiAnalysis.length === 0) return;

  document.getElementById('ai-section').style.display = 'block';
  const container = document.getElementById('ai-cards');
  container.innerHTML = '';

  aiAnalysis.forEach(item => {
    const step = results.find(r => r.step === item.stepId) || {};
    const ai   = item.analysis || {};
    const confidence = ai.confidenceScore || '—';

    const card = document.createElement('div');
    card.className = 'ai-card';
    card.setAttribute('role', 'article');

    card.innerHTML = `
      <div class="ai-card-header">
        <div class="ai-step-icon">${step.icon || '❓'}</div>
        <div class="ai-step-info">
          <div class="ai-step-label">${item.label}</div>
          <div class="ai-step-error">${item.error || ''}</div>
        </div>
        <div class="ai-confidence">
          <span class="ai-confidence-val">${confidence}%</span>
          <span class="ai-confidence-label">Confidence</span>
        </div>
      </div>
      <div class="ai-card-body">
        <div class="ai-field">
          <div class="ai-field-icon">📋</div>
          <div class="ai-field-title">Failure Summary</div>
          <div class="ai-field-content">${ai.failureSummary || 'Not available'}</div>
        </div>
        <div class="ai-field">
          <div class="ai-field-icon">🔍</div>
          <div class="ai-field-title">Likely Root Cause</div>
          <div class="ai-field-content">${ai.likelyRootCause || 'Not available'}</div>
        </div>
        <div class="ai-field">
          <div class="ai-field-icon">💼</div>
          <div class="ai-field-title">Business Impact</div>
          <div class="ai-field-content">${ai.businessImpact || 'Not available'}</div>
        </div>
        <div class="ai-field">
          <div class="ai-field-icon">🔧</div>
          <div class="ai-field-title">Suggested Fix</div>
          <div class="ai-field-content">${ai.suggestedFix || 'Not available'}</div>
        </div>
        <div class="ai-field">
          <div class="ai-field-icon">🎯</div>
          <div class="ai-field-title">Better Selector</div>
          <div class="ai-field-content">
            <code class="ai-selector">${ai.betterSelectorRecommendation || 'Not available'}</code>
          </div>
        </div>
        <div class="ai-field">
          <div class="ai-field-icon">🐛</div>
          <div class="ai-field-title">Possible Product Bug</div>
          <div class="ai-field-content">${ai.possibleProductBug || 'Not available'}</div>
        </div>
        <div class="ai-field">
          <div class="ai-field-icon">🛡️</div>
          <div class="ai-field-title">Prevention Strategy</div>
          <div class="ai-field-content">${ai.preventionStrategy || 'Not available'}</div>
        </div>
        <div class="ai-field">
          <div class="ai-field-icon">🕐</div>
          <div class="ai-field-title">Analyzed At</div>
          <div class="ai-field-content">${new Date(item.generatedAt).toLocaleString()}</div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// ─── Render Heatmap ───────────────────────────────────────
function renderHeatmap(results) {
  const grid = document.getElementById('heatmap-grid');
  grid.innerHTML = '';

  results.forEach(step => {
    const cell = document.createElement('div');
    cell.className = `heatmap-cell ${heatClass(step)}`;
    cell.setAttribute('title', `${step.label} — ${step.status} — Risk: ${step.risk}`);

    const riskColors = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#f43f5e' };
    const statusIcons = { passed: '✅', failed: '❌', skipped: '⏭️', running: '⏳' };

    cell.innerHTML = `
      <div class="heatmap-icon">${step.icon}</div>
      <div class="heatmap-label">${step.label}</div>
      <span class="heatmap-risk" style="background:${riskColors[step.risk]}22;color:${riskColors[step.risk]};border:1px solid ${riskColors[step.risk]}55">
        ${statusIcons[step.status]} ${step.risk}
      </span>
    `;

    cell.addEventListener('click', () => openStepModal(step));
    grid.appendChild(cell);
  });
}

// ─── Filter Tabs ──────────────────────────────────────────
function initFilterTabs(results) {
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      renderStepCards(results, btn.dataset.filter);
    });
  });
}

// ─── Step Detail Modal ────────────────────────────────────
function openStepModal(step) {
  const overlay = document.getElementById('modal-overlay');
  const title   = document.getElementById('modal-title');
  const content = document.getElementById('modal-content');

  title.textContent = `${step.icon} ${step.label} — Details`;

  content.innerHTML = `
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
      ${[
        ['Step ID', step.step],
        ['Status', `<strong style="color:var(--status-${step.status})">${step.status.toUpperCase()}</strong>`],
        ['Risk Level', step.risk.toUpperCase()],
        ['Duration', step.duration ? (step.duration / 1000).toFixed(3) + 's' : '—'],
        ['URL', step.url || '—'],
        ['Selector', step.selector || '—'],
        ['Description', step.description || '—'],
        ['Screenshot', step.screenshot || 'None'],
      ].map(([k, v]) => `
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:8px 12px;color:var(--text-muted);font-size:0.75rem;font-weight:600;text-transform:uppercase;white-space:nowrap">${k}</td>
          <td style="padding:8px 12px;font-size:0.82rem">${v}</td>
        </tr>
      `).join('')}
    </table>
    ${step.error ? `<p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:6px;font-weight:600">ERROR MESSAGE:</p>
      <pre>${step.error}</pre>` : ''}
    ${step.domSnapshot ? `<p style="font-size:0.75rem;color:var(--text-muted);margin:12px 0 6px;font-weight:600">DOM SNAPSHOT (first 1000 chars):</p>
      <pre>${step.domSnapshot.substring(0, 800)}</pre>` : ''}
  `;

  overlay.style.display = 'flex';
}

// ─── Export Report ────────────────────────────────────────
async function exportReport(results, aiAnalysis) {
  // Try to fetch the pre-generated HTML report first
  try {
    const res = await fetch('../reports/report.html');
    if (res.ok) {
      const html = await res.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `cypress-journey-report-${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
  } catch (_) { /* fall through to text export */ }

  // Fallback: generate story text and download as .txt
  const story = buildStoryReport(results, aiAnalysis || []);
  const blob  = new Blob([story], { type: 'text/plain' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = `cypress-journey-report-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Load Data ────────────────────────────────────────────
async function loadData() {
  let results    = null;
  let aiAnalysis = null;

  try {
    const res = await fetch(RESULTS_PATH);
    if (res.ok) results = await res.json();
  } catch (_) {
    console.warn('Could not fetch workflow-results.json — using embedded sample data.');
  }

  try {
    const res = await fetch(AI_ANALYSIS_PATH);
    if (res.ok) aiAnalysis = await res.json();
  } catch (_) {
    console.warn('Could not fetch ai-analysis.json');
  }

  // Fallback to embedded sample
  if (!results) results = SAMPLE_RESULTS;
  if (!aiAnalysis && results.some(r => r.status === 'failed')) {
    aiAnalysis = SAMPLE_AI_ANALYSIS;
  }

  return { results, aiAnalysis };
}

// ─── Main Init ────────────────────────────────────────────
async function init() {
  document.getElementById('footer-time').textContent = new Date().toLocaleString();

  const { results, aiAnalysis } = await loadData();

  // Show AI model badge if available
  const firstAi = (aiAnalysis || []).find(a => a.model);
  if (firstAi) {
    const badge = document.querySelector('.ai-badge');
    if (badge) badge.textContent = `Powered by ${(firstAi.provider || 'OpenAI').toUpperCase()} ${firstAi.model || 'GPT-4o'}`;
  }

  renderStats(results);
  renderJourneyFlow(results);
  renderStepCards(results, 'all');
  renderAiAnalysis(aiAnalysis, results);
  renderHeatmap(results);
  initFilterTabs(results);

  // Story report
  const story = buildStoryReport(results, aiAnalysis || []);
  document.getElementById('story-report').textContent = story;

  // Refresh button
  document.getElementById('btn-refresh').addEventListener('click', () => {
    init();
  });

  // Export button — downloads HTML report if available, else text
  document.getElementById('btn-export').addEventListener('click', () => {
    exportReport(results, aiAnalysis);
  });

  // Modal close
  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('modal-overlay').style.display = 'none';
  });
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) {
      document.getElementById('modal-overlay').style.display = 'none';
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.getElementById('modal-overlay').style.display = 'none';
  });
}

// ─── Embedded Sample Data (fallback when no server) ───────
const SAMPLE_RESULTS = [
  { step:'visit',    icon:'🧑', label:'Visit Site',      status:'passed',  duration:850,  screenshot:null, error:null, url:'https://www.saucedemo.com',             risk:'low',      description:'Customer visits the e-commerce homepage' },
  { step:'login',    icon:'🔐', label:'Login',            status:'passed',  duration:1200, screenshot:null, error:null, url:'https://www.saucedemo.com/inventory.html',risk:'medium',  description:'Customer logs in with valid credentials' },
  { step:'browse',   icon:'🔎', label:'Browse Products',  status:'passed',  duration:950,  screenshot:null, error:null, url:'https://www.saucedemo.com/inventory.html',risk:'medium',  description:'Customer browses the product catalog' },
  { step:'product',  icon:'📦', label:'Open Product',     status:'passed',  duration:780,  screenshot:null, error:null, url:'https://www.saucedemo.com/inventory-item.html',risk:'medium',description:'Customer opens the first available product' },
  { step:'cart',     icon:'🛒', label:'Add To Cart',      status:'passed',  duration:620,  screenshot:null, error:null, url:'https://www.saucedemo.com/inventory-item.html',risk:'high',  description:'Customer adds the selected product to cart' },
  { step:'viewcart', icon:'👜', label:'View Cart',         status:'passed',  duration:540,  screenshot:null, error:null, url:'https://www.saucedemo.com/cart.html',   risk:'high',     description:'Customer views the shopping cart' },
  { step:'checkout', icon:'💳', label:'Checkout',          status:'failed',  duration:1580, screenshot:'cypress/screenshots/checkout_failed.png', error:"Timed out retrying after 10000ms: Expected to find element: [data-test='checkout'] but never found it", url:'https://www.saucedemo.com/cart.html', risk:'critical', description:'Customer proceeds through checkout flow', domSnapshot:"<div class='cart_footer'><a class='btn_secondary' href='/inventory.html'>Continue Shopping</a></div>", selector:"[data-test='checkout']" },
  { step:'success',  icon:'✅', label:'Order Success',     status:'skipped', duration:0,    screenshot:null, error:null, url:null,                                    risk:'critical',  description:'Order is confirmed and placed successfully' }
];

const SAMPLE_AI_ANALYSIS = [
  {
    stepId: 'checkout',
    label: 'Checkout',
    risk: 'critical',
    error: "Timed out retrying after 10000ms: Expected to find element: [data-test='checkout'] but never found it",
    analysis: {
      failureSummary: "The Checkout step failed because the checkout button with selector [data-test='checkout'] could not be found within the 10-second timeout, preventing the customer from completing their purchase.",
      likelyRootCause: "Race condition: The cart page JavaScript bundle hadn't finished mounting the checkout footer component within the default timeout. Alternatively, the cart may have been empty, causing the button not to render conditionally.",
      businessImpact: "CRITICAL — Direct revenue impact. Customer cannot complete purchase = cart abandonment. Every minute of this failure in production can mean hundreds of lost transactions and damaged brand trust.",
      suggestedFix: "1. Increase timeout: cy.get('[data-test=\"checkout\"]', { timeout: 20000 })\n2. Assert cart is not empty before clicking\n3. Add cy.intercept() to wait for cart API response\n4. Verify URL is /cart.html before interacting",
      betterSelectorRecommendation: "Primary: [data-test='checkout']\nFallback 1: button.checkout_button\nFallback 2: a[href='/checkout-step-one.html']\nFallback 3: cy.contains('button', 'Checkout')",
      possibleProductBug: "Possible YES — The conditional rendering of the checkout button might have a hydration bug. Verify with devs if button renders consistently when cart is navigated to programmatically vs. via UI click.",
      preventionStrategy: "Add pre-click assertions, use network interceptors, implement exponential retry logic, and maintain data-test attributes with the dev team as part of their Definition of Done.",
      confidenceScore: 87
    },
    generatedAt: new Date().toISOString()
  }
];

// ─── Bootstrap ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
