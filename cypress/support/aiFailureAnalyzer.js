/**
 * ============================================================
 * AI FAILURE ANALYZER — OpenAI Integration
 * Cypress Visual Journey Intelligence
 * Author: Saran Kumar
 * ============================================================
 *
 * Reads workflow-results.json, identifies failed steps,
 * calls OpenAI GPT-4o with structured QA prompts, and writes:
 *   - reports/ai-analysis.json   (structured JSON)
 *   - reports/story-report.txt   (human-readable narrative)
 *   - reports/report.html        (exportable HTML report)
 *
 * Usage (Node.js):
 *   node scripts/runAiAnalysis.js
 *   npm run analyze:ai
 */

'use strict';

require('dotenv').config();
const fs      = require('fs');
const path    = require('path');
const { OpenAI } = require('openai');

// ─── Configuration from .env ──────────────────────────────
const AI_PROVIDER    = process.env.AI_PROVIDER    || 'openai';
const API_KEY        = process.env.OPENAI_API_KEY;
const MODEL          = process.env.AI_MODEL       || process.env.OPENAI_MODEL || 'gpt-4o';
const MAX_TOKENS     = parseInt(process.env.AI_MAX_TOKENS  || '4096', 10);
const TEMPERATURE    = parseFloat(process.env.AI_TEMPERATURE || '0.7');
const ENABLE_AI      = process.env.ENABLE_AI_ANALYSIS !== 'false';

// ─── Paths ────────────────────────────────────────────────
const RESULTS_PATH = path.join(process.cwd(), 'reports', 'workflow-results.json');
const AI_OUT_PATH  = path.join(process.cwd(), 'reports', 'ai-analysis.json');
const STORY_PATH   = path.join(process.cwd(), 'reports', 'story-report.txt');
const HTML_PATH    = path.join(process.cwd(), 'reports', 'report.html');

// ─── OpenAI Client ────────────────────────────────────────
let openai = null;
if (API_KEY && API_KEY !== 'sk-your-openai-api-key-here') {
  openai = new OpenAI({ apiKey: API_KEY });
}

// ─── System Role Prompt ───────────────────────────────────
const SYSTEM_PROMPT = `You are a Senior QA Architect and Automation Engineering expert with 15+ years of experience in Cypress, Playwright, and Selenium.

Your job is to analyze Cypress E2E test failures with surgical precision.

When given a failed test step, you must: 
- Diagnose the root cause with technical depth
- Identify business impact clearly for non-technical stakeholders
- Provide actionable, copy-paste ready fixes
- Suggest resilient selectors (prefer data-test attributes)
- Assess whether this is a test bug or a product bug
- Give a confidence score based on available evidence

Always respond with ONLY valid JSON — no markdown fences, no explanation text outside JSON.`;

// ─── Per-Step AI Prompt Builder ───────────────────────────
function buildPrompt(step, baseUrl) {
  return `Analyze this Cypress E2E test step failure and respond with ONLY a valid JSON object.

WORKFLOW CONTEXT:
- Application: E-Commerce (SauceDemo)
- Base URL: ${baseUrl || process.env.BASE_URL || 'https://www.saucedemo.com'}

FAILED STEP:
- Step ID        : ${step.step}
- Step Label     : ${step.label}
- Business Goal  : ${step.description || 'Not provided'}
- Risk Level     : ${step.risk}
- Current URL    : ${step.url || 'Unknown'}
- CSS Selector   : ${step.selector || 'Not specified'}
- Error Message  : ${step.error}
- Error Timestamp: ${new Date().toISOString()}
- DOM Snapshot   : ${step.domSnapshot ? step.domSnapshot.substring(0, 1200) : 'Not captured'}

Respond with this exact JSON structure:
{
  "failureSummary": "1-2 sentence plain-English summary of what failed and why",
  "likelyRootCause": "Technical root cause with specific details about why the failure occurred",
  "businessImpact": "Impact on user journey, revenue, and business KPIs in stakeholder language",
  "suggestedFix": "Step-by-step numbered fix with actual code examples",
  "betterSelectorRecommendation": "Recommended primary and fallback selectors with rationale",
  "possibleProductBug": "Assessment: is this a test issue or a real product bug? Evidence?",
  "preventionStrategy": "Long-term prevention: retry logic, interceptors, data-test policies",
  "debuggingSteps": "Step-by-step debugging checklist for the QA engineer",
  "relatedRisks": "Other steps in this workflow that might fail due to the same root cause",
  "confidenceScore": 0
}`;
}

// ─── Real OpenAI Analysis ─────────────────────────────────
async function analyzeWithOpenAI(step) {
  const prompt = buildPrompt(step);

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: prompt }
    ],
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    response_format: { type: 'json_object' }
  });

  const raw = response.choices[0].message.content;
  const usage = response.usage;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    // Strip markdown fences if present despite json_object mode
    const cleaned = raw.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(cleaned);
  }

  return {
    analysis: parsed,
    tokensUsed: usage ? (usage.total_tokens || 0) : 0,
    model: MODEL,
    provider: AI_PROVIDER
  };
}

// ─── Mock Analysis (fallback when no key) ────────────────
function buildMockAnalysis(step) {
  return {
    analysis: {
      failureSummary: `The "${step.label}" step failed: ${(step.error || '').substring(0, 180)}`,
      likelyRootCause: `Element not found within timeout. Possible causes: (1) Selector "${step.selector}" is invalid or changed, (2) Page not fully loaded, (3) Race condition in SPA rendering.`,
      businessImpact: `Risk level is ${step.risk.toUpperCase()}. This failure prevents customers from completing the ${step.label} action, directly impacting conversion rates and user experience.`,
      suggestedFix: `1. Increase timeout: cy.get('${step.selector || '[data-test="element"]'}', { timeout: 20000 })\n2. Add visibility assertion: .should('be.visible')\n3. Verify selector in DevTools\n4. Check for dynamic content loading`,
      betterSelectorRecommendation: `Primary: [data-test="${step.step}"]\nFallback: [aria-label="${step.label}"]\nSemantic: cy.contains('button', '${step.label}')`,
      possibleProductBug: `Possible — the ${step.risk === 'critical' ? 'critical' : 'non-critical'} nature of this step warrants investigation with the dev team to rule out a real product regression.`,
      preventionStrategy: `Add data-test attributes as policy, implement cy.intercept() for API waits, use cy.waitUntil() for dynamic content, add pre-step assertions.`,
      debuggingSteps: `1. Run test in headed mode: npx cypress open\n2. Inspect element in DevTools: right-click > Inspect\n3. Verify selector: $('${step.selector || ''}') in console\n4. Check network tab for failed API calls\n5. Review Cypress screenshots in cypress/screenshots/`,
      relatedRisks: `Steps following "${step.label}" may also fail if they depend on the same UI state. Check steps with risk level "high" or "critical".`,
      confidenceScore: 65
    },
    tokensUsed: 0,
    model: 'mock',
    provider: 'mock'
  };
}

// ─── HTML Report Generator ────────────────────────────────
function generateHtmlReport(results, aiAnalysis, generatedAt) {
  const passed  = results.filter(r => r.status === 'passed').length;
  const failed  = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const totalMs = results.reduce((s, r) => s + (r.duration || 0), 0);
  const pct     = results.length ? Math.round((passed / results.length) * 100) : 0;

  const statusColor = { passed: '#10b981', failed: '#f43f5e', skipped: '#64748b', running: '#f59e0b' };
  const riskColor   = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#f43f5e' };

  const stepRows = results.map(step => {
    const ai   = (aiAnalysis || []).find(a => a.stepId === step.step);
    const color = statusColor[step.status] || '#94a3b8';
    const rColor = riskColor[step.risk] || '#94a3b8';

    let aiSection = '';
    if (ai && ai.analysis) {
      const a = ai.analysis;
      aiSection = `
        <tr class="ai-row">
          <td colspan="7" style="padding:0">
            <div class="ai-panel">
              <div class="ai-panel-header">🤖 AI Failure Analysis &nbsp;<span class="ai-confidence">Confidence: ${a.confidenceScore || '—'}%</span></div>
              <div class="ai-grid">
                <div class="ai-item"><strong>📋 Summary</strong><p>${a.failureSummary || '—'}</p></div>
                <div class="ai-item"><strong>🔍 Root Cause</strong><p>${a.likelyRootCause || '—'}</p></div>
                <div class="ai-item"><strong>💼 Business Impact</strong><p>${a.businessImpact || '—'}</p></div>
                <div class="ai-item"><strong>🔧 Suggested Fix</strong><pre>${a.suggestedFix || '—'}</pre></div>
                <div class="ai-item"><strong>🎯 Better Selector</strong><code>${a.betterSelectorRecommendation || '—'}</code></div>
                <div class="ai-item"><strong>🐛 Product Bug?</strong><p>${a.possibleProductBug || '—'}</p></div>
                <div class="ai-item"><strong>🛡️ Prevention</strong><p>${a.preventionStrategy || '—'}</p></div>
                <div class="ai-item"><strong>🔬 Debug Steps</strong><pre>${a.debuggingSteps || '—'}</pre></div>
              </div>
            </div>
          </td>
        </tr>`;
    }

    return `
      <tr class="step-row status-${step.status}">
        <td class="icon-cell">${step.icon || '•'}</td>
        <td><strong>${step.label}</strong><br/><small>${step.description || ''}</small></td>
        <td><span class="badge" style="background:${color}22;color:${color};border:1px solid ${color}55">${step.status.toUpperCase()}</span></td>
        <td><span class="badge" style="background:${rColor}22;color:${rColor};border:1px solid ${rColor}55">${step.risk.toUpperCase()}</span></td>
        <td>${step.duration ? (step.duration / 1000).toFixed(2) + 's' : '—'}</td>
        <td style="font-family:monospace;font-size:0.72em;color:#64748b">${step.url ? new URL(step.url).pathname : '—'}</td>
        <td>${step.error ? `<span class="error-pill" title="${step.error}">View Error</span>` : '—'}</td>
      </tr>
      ${step.status === 'failed' ? `
      <tr class="error-row">
        <td colspan="7">
          <div class="error-box">❌ ${step.error || ''}</div>
        </td>
      </tr>` : ''}
      ${aiSection}`;
  }).join('');

  const journeyLine = results.map(s => `${s.icon} ${s.label}`).join(' → ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Cypress Visual Journey Intelligence — Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',system-ui,sans-serif;background:#0a0b14;color:#f0f1ff;min-height:100vh;line-height:1.6}
    a{color:#6366f1}
    /* Header */
    .header{background:linear-gradient(135deg,#0d0e1e,#12132a);border-bottom:1px solid rgba(99,102,241,0.2);padding:32px 48px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
    .logo{display:flex;align-items:center;gap:16px}
    .logo-icon{width:52px;height:52px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.4rem}
    .logo h1{font-size:1.4rem;font-weight:800;background:linear-gradient(135deg,#fff 40%,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .logo p{font-size:0.78rem;color:#64748b;font-style:italic;margin-top:2px}
    .meta{text-align:right;font-size:0.78rem;color:#64748b}
    .meta strong{color:#94a3b8;display:block;font-size:0.82rem;margin-bottom:4px}
    /* Stats */
    .stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;padding:32px 48px;background:#10111d;border-bottom:1px solid rgba(99,102,241,0.1)}
    .stat{background:#151728;border:1px solid rgba(99,102,241,0.15);border-radius:12px;padding:20px;display:flex;gap:14px;align-items:center}
    .stat-icon{font-size:1.6rem}
    .stat-val{font-size:1.6rem;font-weight:800;line-height:1}
    .stat-key{font-size:0.65rem;color:#64748b;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-top:2px}
    /* Journey bar */
    .journey{padding:24px 48px;background:#0d0e1e;border-bottom:1px solid rgba(99,102,241,0.1);font-size:0.82rem;color:#94a3b8;word-break:break-word}
    .journey strong{color:#f0f1ff;display:block;margin-bottom:8px;font-size:0.9rem}
    .journey-line{background:#151728;border:1px solid rgba(99,102,241,0.15);border-radius:8px;padding:14px 20px;font-family:'JetBrains Mono',monospace;font-size:0.78rem;color:#a5b4fc}
    /* Progress */
    .progress-wrap{padding:20px 48px;background:#0d0e1e;border-bottom:1px solid rgba(99,102,241,0.1);display:flex;align-items:center;gap:16px}
    .progress-track{flex:1;height:8px;background:rgba(99,102,241,0.12);border-radius:99px;overflow:hidden}
    .progress-fill{height:100%;background:linear-gradient(90deg,#10b981,#06b6d4);border-radius:99px;transition:width .8s ease}
    .progress-lbl{font-size:0.8rem;color:#94a3b8;font-weight:600;white-space:nowrap}
    /* Table */
    .table-wrap{padding:32px 48px}
    .table-wrap h2{font-size:1.1rem;font-weight:700;margin-bottom:20px;color:#f0f1ff}
    table{width:100%;border-collapse:collapse;background:#151728;border:1px solid rgba(99,102,241,0.15);border-radius:12px;overflow:hidden}
    th{background:#10111d;padding:14px 16px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#64748b;text-align:left;border-bottom:1px solid rgba(99,102,241,0.15)}
    td{padding:14px 16px;border-bottom:1px solid rgba(99,102,241,0.08);font-size:0.82rem;vertical-align:top}
    .step-row:hover{background:#1c1f36}
    .step-row.status-failed td{border-left:3px solid #f43f5e}
    .step-row.status-passed td{border-left:3px solid #10b981}
    .step-row.status-skipped td{border-left:3px solid #64748b;opacity:.6}
    .icon-cell{font-size:1.4rem;text-align:center}
    .badge{font-size:0.65rem;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap}
    .error-box{background:rgba(244,63,94,0.08);border:1px solid rgba(244,63,94,0.25);border-radius:8px;padding:12px 16px;font-family:'JetBrains Mono',monospace;font-size:0.72rem;color:#f43f5e;word-break:break-all;margin:0 16px 12px}
    .error-pill{background:rgba(244,63,94,0.15);color:#f43f5e;border:1px solid rgba(244,63,94,0.3);padding:2px 8px;border-radius:4px;font-size:0.68rem;font-weight:600;cursor:pointer}
    /* AI Panel */
    .ai-panel{background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.04));border-top:1px solid rgba(99,102,241,0.15);margin:0 0 4px;padding:24px 32px}
    .ai-panel-header{font-size:0.85rem;font-weight:700;color:#a5b4fc;margin-bottom:16px;display:flex;align-items:center;gap:12px}
    .ai-confidence{font-size:0.72rem;background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);padding:3px 10px;border-radius:20px;font-weight:700}
    .ai-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
    .ai-item{background:rgba(15,16,28,0.6);border:1px solid rgba(99,102,241,0.12);border-radius:8px;padding:16px}
    .ai-item strong{font-size:0.72rem;text-transform:uppercase;letter-spacing:.06em;color:#818cf8;display:block;margin-bottom:8px}
    .ai-item p{font-size:0.78rem;color:#94a3b8;line-height:1.6}
    .ai-item pre{font-family:'JetBrains Mono',monospace;font-size:0.7rem;color:#a5b4fc;background:rgba(0,0,0,0.3);border-radius:6px;padding:10px;white-space:pre-wrap;word-break:break-word;margin-top:6px}
    .ai-item code{font-family:'JetBrains Mono',monospace;font-size:0.72rem;color:#06b6d4;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);padding:6px 10px;border-radius:6px;display:block;margin-top:6px;word-break:break-all}
    /* Story */
    .story-wrap{padding:0 48px 32px}
    .story-wrap h2{font-size:1.1rem;font-weight:700;margin-bottom:20px;color:#f0f1ff}
    .story-box{background:#151728;border:1px solid rgba(99,102,241,0.15);border-radius:12px;padding:28px 32px;font-family:'JetBrains Mono',monospace;font-size:0.78rem;line-height:1.9;color:#94a3b8;white-space:pre-wrap;max-height:500px;overflow-y:auto}
    /* Footer */
    .footer{text-align:center;padding:28px 48px;font-size:0.75rem;color:#475569;border-top:1px solid rgba(99,102,241,0.1);background:#0d0e1e}
    .footer strong{color:#818cf8}
    /* Print */
    @media print{
      body{background:#fff;color:#111}
      .header,.stats,.journey,.table-wrap,.story-wrap,.footer{padding-left:24px;padding-right:24px}
      table{border:1px solid #e2e8f0}
      th{background:#f8fafc;color:#374151}
      td{color:#374151;border-color:#e2e8f0}
      .ai-panel{background:#f8fafc}
      .story-box{background:#f8fafc;color:#374151;max-height:none}
    }
    @media(max-width:768px){
      .header,.stats,.journey,.table-wrap,.story-wrap,.footer,.progress-wrap{padding-left:16px;padding-right:16px}
      .stats{grid-template-columns:repeat(2,1fr)}
      .ai-grid{grid-template-columns:1fr}
    }
  </style>
</head>
<body>

<header class="header">
  <div class="logo">
    <div class="logo-icon">🎭</div>
    <div>
      <h1>Cypress Visual Journey Intelligence</h1>
      <p>Visual AI-powered E2E workflow automation for modern web applications.</p>
    </div>
  </div>
  <div class="meta">
    <strong>Execution Report</strong>
    Generated: ${generatedAt}<br/>
    Author: Saran Kumar<br/>
    AI Provider: ${AI_PROVIDER.toUpperCase()} · ${MODEL}<br/>
    Target: ${process.env.BASE_URL || 'https://www.saucedemo.com'}
  </div>
</header>

<section class="stats">
  <div class="stat"><div class="stat-icon">📋</div><div><div class="stat-val">${results.length}</div><div class="stat-key">Total Steps</div></div></div>
  <div class="stat"><div class="stat-icon">✅</div><div><div class="stat-val" style="color:#10b981">${passed}</div><div class="stat-key">Passed</div></div></div>
  <div class="stat"><div class="stat-icon">❌</div><div><div class="stat-val" style="color:#f43f5e">${failed}</div><div class="stat-key">Failed</div></div></div>
  <div class="stat"><div class="stat-icon">⏭️</div><div><div class="stat-val" style="color:#64748b">${skipped}</div><div class="stat-key">Skipped</div></div></div>
  <div class="stat"><div class="stat-icon">⏱️</div><div><div class="stat-val">${(totalMs/1000).toFixed(1)}s</div><div class="stat-key">Total Time</div></div></div>
  <div class="stat"><div class="stat-icon">📊</div><div><div class="stat-val" style="color:${pct===100?'#10b981':pct>=60?'#f59e0b':'#f43f5e'}">${pct}%</div><div class="stat-key">Pass Rate</div></div></div>
</section>

<section class="journey">
  <strong>🗺️ Journey Execution Map</strong>
  <div class="journey-line">${journeyLine}</div>
</section>

<div class="progress-wrap">
  <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
  <span class="progress-lbl">${pct}% complete · ${passed}/${results.length} steps passed</span>
</div>

<div class="table-wrap">
  <h2>📊 Step Execution Details</h2>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>Step</th>
        <th>Status</th>
        <th>Risk</th>
        <th>Duration</th>
        <th>Page</th>
        <th>Error</th>
      </tr>
    </thead>
    <tbody>${stepRows}</tbody>
  </table>
</div>

<div class="story-wrap">
  <h2>📖 Story Mode Report</h2>
  <div class="story-box" id="story">${buildStoryText(results, aiAnalysis)}</div>
</div>

<footer class="footer">
  <strong>Cypress Visual Journey Intelligence</strong> &nbsp;·&nbsp;
  Author: <strong>Saran Kumar</strong> &nbsp;·&nbsp;
  AI Provider: ${AI_PROVIDER.toUpperCase()} (${MODEL}) &nbsp;·&nbsp;
  Generated: ${generatedAt} &nbsp;·&nbsp;
  <a href="https://github.com/sarankumar" style="color:#6366f1">GitHub</a>
</footer>

</body>
</html>`;
}

// ─── Text Story Report Builder ────────────────────────────
function buildStoryText(results, aiAnalysis) {
  const lines = [];
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('  🎭  VISUAL JOURNEY INTELLIGENCE — STORY MODE REPORT');
  lines.push('  Author   : Saran Kumar');
  lines.push('  Generated: ' + new Date().toLocaleString());
  lines.push('═══════════════════════════════════════════════════════════════\n');

  results.forEach(step => {
    if (step.status === 'passed') {
      lines.push(`${step.icon}  ${step.description || step.label}`);
      lines.push(`   ✅ PASSED  |  ⏱️ ${(step.duration / 1000).toFixed(2)}s  |  📍 ${step.url ? new URL(step.url).pathname : '—'}`);
    } else if (step.status === 'failed') {
      lines.push(`${step.icon}  ${step.description || step.label}`);
      lines.push('   ❌ FAILED');

      const ai = (aiAnalysis || []).find(a => a.stepId === step.step);
      if (ai && ai.analysis) {
        const a = ai.analysis;
        lines.push('');
        lines.push('   🤖 AI FAILURE ANALYSIS:');
        lines.push('   ─────────────────────────────────────────────');
        lines.push(`   📋 Summary      : ${a.failureSummary || '—'}`);
        lines.push(`   🔍 Root Cause   : ${a.likelyRootCause || '—'}`);
        lines.push(`   💼 Biz Impact   : ${a.businessImpact || '—'}`);
        lines.push(`   🔧 Fix          : ${a.suggestedFix || '—'}`);
        lines.push(`   🎯 Better Sel.  : ${a.betterSelectorRecommendation || '—'}`);
        lines.push(`   🐛 Product Bug? : ${a.possibleProductBug || '—'}`);
        lines.push(`   🛡️ Prevention   : ${a.preventionStrategy || '—'}`);
        lines.push(`   🔬 Debug Steps  : ${a.debuggingSteps || '—'}`);
        lines.push(`   ⚠️  Related Risks: ${a.relatedRisks || '—'}`);
        lines.push(`   📊 Confidence   : ${a.confidenceScore || '—'}%`);
        if (ai.tokensUsed) lines.push(`   🔢 Tokens Used  : ${ai.tokensUsed}`);
      } else {
        lines.push(`   ⚠️  Error: ${step.error || 'Unknown error'}`);
      }
    } else if (step.status === 'skipped') {
      lines.push(`${step.icon}  [SKIPPED] ${step.label}`);
      lines.push('   ⏭️  Skipped — previous critical step failed');
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
  lines.push(`  ⏱️  Total Time : ${(totalMs / 1000).toFixed(2)}s`);
  lines.push(`  📊 Pass Rate  : ${results.length ? Math.round((passed / results.length) * 100) : 0}%`);
  lines.push(`  🤖 AI Provider: ${AI_PROVIDER.toUpperCase()} (${MODEL})`);
  lines.push(`  👤 Author     : Saran Kumar`);
  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}

// ─── Ensure reports dir exists ────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Main ─────────────────────────────────────────────────
async function analyzeFailures() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   🤖  Cypress Visual Journey Intelligence                ║');
  console.log('║   AI Failure Analyzer — OpenAI Integration               ║');
  console.log('║   Author: Saran Kumar                                    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  AI Provider : ${AI_PROVIDER.toUpperCase()}`);
  console.log(`  Model       : ${MODEL}`);
  console.log(`  Max Tokens  : ${MAX_TOKENS}`);
  console.log(`  Temperature : ${TEMPERATURE}`);
  console.log(`  API Key     : ${openai ? '✅ Configured' : '⚠️  Not configured (mock mode)'}`);
  console.log('');

  // Validate results file
  if (!fs.existsSync(RESULTS_PATH)) {
    console.error('❌  workflow-results.json not found. Run Cypress tests first:');
    console.error('    npm test');
    process.exit(1);
  }

  const results    = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  const failedSteps = results.filter(r => r.status === 'failed');

  console.log(`  Total Steps : ${results.length}`);
  console.log(`  ✅ Passed   : ${results.filter(r => r.status === 'passed').length}`);
  console.log(`  ❌ Failed   : ${failedSteps.length}`);
  console.log(`  ⏭️  Skipped  : ${results.filter(r => r.status === 'skipped').length}`);
  console.log('');

  const aiAnalysis = [];

  if (failedSteps.length === 0) {
    console.log('🎉  All steps passed! No AI analysis needed.\n');
  } else {
    if (!openai) {
      console.warn('⚠️  OPENAI_API_KEY not configured — using mock analysis.\n');
    } else {
      console.log(`🧠  Analyzing ${failedSteps.length} failed step(s) with OpenAI ${MODEL}...\n`);
    }

    let totalTokens = 0;

    for (const step of failedSteps) {
      console.log(`   ▶  Analyzing: ${step.icon || ''} ${step.label} [${step.risk.toUpperCase()}]`);

      try {
        const result = openai
          ? await analyzeWithOpenAI(step)
          : buildMockAnalysis(step);

        totalTokens += result.tokensUsed || 0;

        aiAnalysis.push({
          stepId     : step.step,
          label      : step.label,
          risk       : step.risk,
          error      : step.error,
          ...result,
          generatedAt: new Date().toISOString()
        });

        const conf = result.analysis.confidenceScore;
        console.log(`   ✅  Done — Confidence: ${conf}%${result.tokensUsed ? ` · Tokens: ${result.tokensUsed}` : ''}`);
      } catch (err) {
        console.error(`   ❌  Error: ${err.message}`);
        aiAnalysis.push({
          stepId     : step.step,
          label      : step.label,
          risk       : step.risk,
          error      : step.error,
          analysis   : null,
          apiError   : err.message,
          provider   : AI_PROVIDER,
          model      : MODEL,
          generatedAt: new Date().toISOString()
        });
      }
    }

    if (totalTokens > 0) {
      console.log(`\n  🔢  Total tokens used: ${totalTokens}`);
    }
  }

  // Generate outputs
  const generatedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const storyText   = buildStoryText(results, aiAnalysis);
  const htmlReport  = generateHtmlReport(results, aiAnalysis, generatedAt);

  ensureDir(path.join(process.cwd(), 'reports'));

  fs.writeFileSync(AI_OUT_PATH, JSON.stringify(aiAnalysis, null, 2), 'utf8');
  fs.writeFileSync(STORY_PATH,  storyText, 'utf8');
  fs.writeFileSync(HTML_PATH,   htmlReport, 'utf8');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📦  Reports generated:');
  console.log(`  🟢  reports/ai-analysis.json`);
  console.log(`  📄  reports/story-report.txt`);
  console.log(`  🌐  reports/report.html         ← Open in browser to view`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

analyzeFailures().catch(err => {
  console.error('\n💥  Fatal error:', err.message);
  process.exit(1);
});

module.exports = { analyzeFailures, buildPrompt, generateHtmlReport, buildStoryText };
