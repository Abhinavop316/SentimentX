import { DataSimulator } from "./dataSimulator.js";
import { DashboardCharts } from "./charts.js";
import { renderHeatmap } from "./heatmap.js";
import { PoliticalChatbot, attachChatUI } from "./chatbot.js";

const debounce = (fn, delay = 220) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const storage = {
  getTheme: () => localStorage.getItem("pm_theme") || "light",
  setTheme: (v) => localStorage.setItem("pm_theme", v),
  getDemoMode: () => localStorage.getItem("pm_demo_mode") || "low",
  setDemoMode: (v) => localStorage.setItem("pm_demo_mode", v)
};

const els = {
  tabLinks: [...document.querySelectorAll(".tab-link")],
  tabViews: [...document.querySelectorAll(".tab-view")],
  activeTabTitle: document.getElementById("activeTabTitle"),
  tabLoadingAnnouncer: document.getElementById("tabLoadingAnnouncer"),
  appShell: document.getElementById("appShell"),
  menuToggle: document.getElementById("menuToggle"),
  sidebarCollapseToggle: document.getElementById("sidebarCollapseToggle"),
  sidebarBackdrop: document.getElementById("sidebarBackdrop"),
  languageFilter: document.getElementById("languageFilter"),
  regionFilter: document.getElementById("regionFilter"),
  timeFilter: document.getElementById("timeFilter"),
  liveFeed: document.getElementById("liveFeed"),
  strategyList: document.getElementById("strategyList"),
  trendingIssues: document.getElementById("trendingIssues"),
  heatmapGrid: document.getElementById("heatmapGrid"),
  boothInsightContent: document.getElementById("boothInsightContent"),
  constituencyCards: document.getElementById("constituencyCards"),
  timelineSlider: document.getElementById("timelineSlider"),
  timelineStamp: document.getElementById("timelineStamp"),
  alertContainer: document.getElementById("alertContainer"),
  kpiTotal: document.getElementById("kpiTotal"),
  kpiPositive: document.getElementById("kpiPositive"),
  kpiNegative: document.getElementById("kpiNegative"),
  kpiNeutral: document.getElementById("kpiNeutral"),
  themeToggle: document.getElementById("themeToggle"),
  demoModeToggle: document.getElementById("demoModeToggle"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
  warRoomBtn: document.getElementById("warRoomBtn"),
  modeButtons: [...document.querySelectorAll(".mode-btn")],
  assistantForm: document.getElementById("assistantForm"),
  assistantInput: document.getElementById("assistantInput"),
  assistantMessages: document.getElementById("assistantMessages"),
  chatFab: document.getElementById("chatFab"),
  chatWidget: document.getElementById("chatWidget"),
  chatWidgetClose: document.getElementById("chatWidgetClose"),
  widgetForm: document.getElementById("widgetForm"),
  widgetInput: document.getElementById("widgetInput"),
  widgetMessages: document.getElementById("widgetMessages"),
  warRoomOverlay: document.getElementById("warRoomOverlay"),
  reportCloseBtn: document.getElementById("reportCloseBtn"),
  reportPrintBtn: document.getElementById("reportPrintBtn"),
  reportExportBtn: document.getElementById("reportExportBtn"),
  mythFactOverlay: document.getElementById("mythFactOverlay"),
  mythFactCloseBtn: document.getElementById("mythFactCloseBtn"),
  mythFactModalContent: document.getElementById("mythFactModalContent"),
  reportMeta: document.getElementById("reportMeta"),
  reportKpis: document.getElementById("reportKpis"),
  reportConfidence: document.getElementById("reportConfidence"),
  reportIssues: document.getElementById("reportIssues"),
  reportStrategies: document.getElementById("reportStrategies"),
  reportRiskConstituencies: document.getElementById("reportRiskConstituencies"),
  reportRiskDetail: document.getElementById("reportRiskDetail"),
  riskRanking: document.getElementById("riskRanking"),
  confidenceMetrics: document.getElementById("confidenceMetrics"),
  voterPulseSummary: document.getElementById("voterPulseSummary"),
  voterChecklist: document.getElementById("voterChecklist"),
  voterHelpline: document.getElementById("voterHelpline"),
  misinfoWatch: document.getElementById("misinfoWatch"),
  awarenessAdvisory: document.getElementById("awarenessAdvisory"),
  factCheckQueue: document.getElementById("factCheckQueue"),
  sourceTrustBoard: document.getElementById("sourceTrustBoard"),
  mythFactCard: document.getElementById("mythFactCard"),
  regionMisinfoHeat: document.getElementById("regionMisinfoHeat")
};

const simulator = new DataSimulator();
const charts = new DashboardCharts();
const chatbot = new PoliticalChatbot();

const ui = {
  filters: {
    language: "all",
    region: "all",
    timeRangeMin: Number(els.timeFilter.value)
  },
  replayIndex: null,
  chatMode: "chatgpt",
  prevNegativeRate: 0,
  selectedBoothId: 1,
  reportSnapshot: null,
  selectedClaimId: null,
  factCheckLookup: new Map()
};

const formatPercent = (num, total) => {
  if (!total) return "0%";
  return `${Math.round((num / total) * 100)}%`;
};

const setSidebarAccent = (tabName) => {
  const activeBtn = els.tabLinks.find((btn) => btn.dataset.tab === tabName);
  if (!activeBtn) return;

  const accent = activeBtn.dataset.accent;
  const accentRgb = activeBtn.dataset.accentRgb;

  if (accent) {
    document.documentElement.style.setProperty("--sidebar-accent", accent);
  }
  if (accentRgb) {
    document.documentElement.style.setProperty("--sidebar-accent-rgb", accentRgb);
  }
};

const setTheme = (theme) => {
  document.body.dataset.theme = theme;
  els.themeToggle.textContent = theme === "dark" ? "Light" : "Dark";
  els.themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  storage.setTheme(theme);
};

const setDemoMode = (mode) => {
  els.demoModeToggle.textContent = mode === "high" ? "High Activity" : "Low Activity";
  els.demoModeToggle.setAttribute("aria-pressed", mode === "high" ? "true" : "false");
  storage.setDemoMode(mode);
  simulator.setDemoMode(mode);
};

const notifyAlert = (text) => {
  const toast = document.createElement("div");
  toast.className = "alert-toast";
  toast.textContent = text;
  els.alertContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4800);
};

const renderFeed = (entries) => {
  els.liveFeed.innerHTML = "";
  entries.slice(0, 16).forEach((entry) => {
    const li = document.createElement("li");
    li.className = "feed-item";

    const confidenceLevel = entry.confidence >= 80 ? "high" : entry.confidence >= 60 ? "medium" : "low";

    li.innerHTML = `
      <div class="feed-meta">
        <span>${entry.source} • ${entry.language} • ${entry.region}</span>
        <span class="confidence-badge ${confidenceLevel}">${entry.confidence}% confidence</span>
      </div>
      <div>${entry.text}</div>
      <div class="feed-meta">
        <span class="feed-tag ${entry.sentiment}">${entry.sentiment}</span>
        <span>Confidence ${entry.confidence}%</span>
      </div>
    `;

    els.liveFeed.appendChild(li);
  });
};

const renderStrategies = (strategies) => {
  els.strategyList.innerHTML = "";
  strategies.forEach((tip) => {
    const li = document.createElement("li");
    li.textContent = tip;
    els.strategyList.appendChild(li);
  });
};

const renderIssues = (issueFreq) => {
  els.trendingIssues.innerHTML = "";
  issueFreq.slice(0, 6).forEach(([issue, count], idx) => {
    const card = document.createElement("div");
    card.className = "constituency-card";
    card.innerHTML = `
      <strong>#${idx + 1} ${issue}</strong>
      <div>${count} mentions</div>
    `;
    els.trendingIssues.appendChild(card);
  });
};

const renderMisinformationWatch = (summary) => {
  if (!els.misinfoWatch) return;

  const narratives = summary.topNarratives.length
    ? summary.topNarratives.map(([topic, count]) => `<li>${topic}: ${count} suspicious mentions</li>`).join("")
    : "<li>No significant suspicious narrative spike detected.</li>";

  els.misinfoWatch.innerHTML = `
    <div class="metric-row">
      <span class="metric-label">Suspicious Signal Rate</span>
      <span class="metric-value">${summary.suspiciousRate}%</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Likely Verifiable Signals</span>
      <span class="metric-value">${summary.verifiedLikely}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">High-Risk Rumor Flags</span>
      <span class="metric-value">${summary.riskCounts.high}</span>
    </div>
    <ul class="report-list">${narratives}</ul>
  `;
};

const renderAwarenessAdvisory = (advisories) => {
  if (!els.awarenessAdvisory) return;
  els.awarenessAdvisory.innerHTML = advisories.map((tip) => `<li>${tip}</li>`).join("");
};

const renderVoterCorner = (filtered, breakdown, misinfoSummary) => {
  if (!els.voterPulseSummary || !els.voterChecklist || !els.voterHelpline) return;

  const total = breakdown.Positive + breakdown.Negative + breakdown.Neutral;
  const mood = breakdown.Positive >= breakdown.Negative ? "Stable" : "Sensitive";
  const integrity = misinfoSummary.suspiciousRate >= 35 ? "High caution" : misinfoSummary.suspiciousRate >= 20 ? "Moderate caution" : "Low caution";

  els.voterPulseSummary.innerHTML = `
    <div class="metric-row">
      <span class="metric-label">Public Mood</span>
      <span class="metric-value">${mood}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Signals Reviewed</span>
      <span class="metric-value">${filtered.length}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Positive Pulse</span>
      <span class="metric-value">${formatPercent(breakdown.Positive, total)}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Misinformation Risk</span>
      <span class="metric-value">${integrity}</span>
    </div>
  `;

  els.voterChecklist.innerHTML = [
    "Check election claims on official Election Commission channels before forwarding.",
    "Do not trust screenshots without source links and date context.",
    "If a message says 'urgent share', verify first, then decide.",
    "Report suspicious election misinformation to local authorities or official grievance portals."
  ].map((item) => `<li>${item}</li>`).join("");

  els.voterHelpline.innerHTML = `
    <article class="voter-help-card">
      <h4>Official Verification</h4>
      <p>Use ECI/CEO websites, district administration notices, and government helplines for fact checks.</p>
    </article>
    <article class="voter-help-card">
      <h4>Safe Sharing Rule</h4>
      <p>Share only when at least two trusted sources confirm the same information.</p>
    </article>
    <article class="voter-help-card">
      <h4>Voting Preparedness</h4>
      <p>Carry valid ID, verify booth details in advance, and follow official queue/update instructions.</p>
    </article>
  `;
};

const classifyClaimPriority = (entry) => {
  let score = 0;
  const text = entry.text.toLowerCase();

  if (entry.confidence < 55) score += 2;
  else if (entry.confidence < 65) score += 1;

  if (entry.source === "Social") score += 1;
  if (entry.sentiment === "Negative") score += 1;
  if (/fake|viral|rumor|evm|boycott|leaked|forwarded|vote cancelled/.test(text)) score += 2;

  if (score >= 5) return "critical";
  if (score >= 3) return "high";
  return "medium";
};

const prioritySlaMinutes = {
  critical: 15,
  high: 30,
  medium: 60
};

const formatSlaState = (entry, priority, currentClock) => {
  const ageMinutes = Math.max(0, Math.floor((currentClock - entry.timestamp) / 60000));
  const remaining = prioritySlaMinutes[priority] - ageMinutes;

  if (remaining >= 0) {
    return `SLA: ${remaining}m left`;
  }

  return `SLA overdue by ${Math.abs(remaining)}m`;
};

const buildMythFact = (entry) => {
  const issueFacts = {
    inflation: "Official CPI and state bulletin trends should be checked before sharing any price panic claims.",
    water: "Municipal water schedules and ward tanker logs are the primary verifiable sources.",
    jobs: "Employment announcements must be validated through government recruitment portals.",
    corruption: "Allegations should be supported by official notices, FIR records, or court filings.",
    safety: "Safety incidents must be verified via police advisories and validated news releases.",
    roads: "Road closure or project claims should be cross-checked with PWD/MCD updates."
  };

  return {
    myth: entry.text,
    fact: issueFacts[entry.issue] || "Verify through Election Commission, district administration, and official government channels.",
    neutralAction: "Publish a neutral myth-vs-fact note and route unresolved claims to the district fact-check cell."
  };
};

const renderMythFactCard = (entry, openModal = false) => {
  if (!els.mythFactCard || !els.mythFactModalContent || !els.mythFactOverlay) return;

  if (!entry) {
    const placeholder = "<p class=\"meta\">Select a queued claim and click Generate to view a Myth vs Fact card.</p>";
    els.mythFactCard.innerHTML = placeholder;
    els.mythFactModalContent.innerHTML = placeholder;
    return;
  }

  const card = buildMythFact(entry);
  const cardMarkup = `
    <div class="myth-fact-block">
      <h4>Claim</h4>
      <p>${card.myth}</p>
    </div>
    <div class="myth-fact-block">
      <h4>Fact Guidance</h4>
      <p>${card.fact}</p>
    </div>
    <div class="myth-fact-block">
      <h4>Neutral Response Action</h4>
      <p>${card.neutralAction}</p>
    </div>
    <small>Context: ${entry.region} | Source: ${entry.source} | Confidence: ${entry.confidence}%</small>
  `;

  els.mythFactCard.innerHTML = cardMarkup;
  els.mythFactModalContent.innerHTML = cardMarkup;
  if (openModal) {
    els.mythFactOverlay.classList.add("open");
    els.mythFactOverlay.setAttribute("aria-hidden", "false");
  }
};

const renderFactCheckQueue = (entries, currentClock) => {
  if (!els.factCheckQueue) return;

  ui.factCheckLookup.clear();

  const queue = entries
    .filter((entry) => entry.confidence < 72 || (entry.source === "Social" && entry.sentiment === "Negative"))
    .slice(0, 10)
    .map((entry) => {
      const priority = classifyClaimPriority(entry);
      const advice = priority === "critical"
        ? "Escalate to district fact-check team immediately."
        : priority === "high"
          ? "Escalate to district fact-check team within 30 min."
          : "Cross-check with official bulletin before amplification.";
      return { entry, priority, advice };
    });

  queue.forEach(({ entry }) => {
    ui.factCheckLookup.set(entry.id, entry);
  });

  if (!ui.selectedClaimId || !ui.factCheckLookup.has(ui.selectedClaimId)) {
    ui.selectedClaimId = queue[0]?.entry.id || null;
  }

  els.factCheckQueue.innerHTML = queue.length
    ? queue.map(({ entry, priority, advice }) => `
        <article class="fact-item ${priority}">
          <strong>${entry.issue} claim | ${entry.region}</strong>
          <div>${entry.text}</div>
          <div class="fact-meta-row">
            <span class="priority-badge ${priority}">${priority.toUpperCase()}</span>
            <span class="sla-badge ${priority}">${formatSlaState(entry, priority, currentClock)}</span>
          </div>
          <small>Source: ${entry.source} | Confidence: ${entry.confidence}% | Action: ${advice}</small>
          <button class="action-btn claim-generate-btn" type="button" data-generate-myth="${entry.id}">Generate Myth vs Fact</button>
        </article>
      `).join("")
    : "<article class=\"fact-item medium\"><strong>No active claims in queue</strong><div>Signals are currently stable.</div></article>";

  renderMythFactCard(ui.selectedClaimId ? ui.factCheckLookup.get(ui.selectedClaimId) : null);
};

const renderSourceTrustBoard = (entries) => {
  if (!els.sourceTrustBoard) return;

  const sourceMap = new Map();
  entries.forEach((entry) => {
    const row = sourceMap.get(entry.source) || { total: 0, confidence: 0, suspicious: 0 };
    row.total += 1;
    row.confidence += entry.confidence;
    if (entry.confidence < 65 || (entry.source === "Social" && entry.sentiment === "Negative")) row.suspicious += 1;
    sourceMap.set(entry.source, row);
  });

  const board = [...sourceMap.entries()].map(([source, row]) => {
    const avg = row.total ? Number((row.confidence / row.total).toFixed(1)) : 0;
    const suspiciousRate = row.total ? Math.round((row.suspicious / row.total) * 100) : 0;
    const tier = avg >= 78 ? "high" : avg >= 66 ? "medium" : "low";
    return { source, avg, suspiciousRate, tier, total: row.total };
  }).sort((a, b) => b.avg - a.avg);

  els.sourceTrustBoard.innerHTML = board.map((row) => `
    <article class="source-item ${row.tier}">
      <strong>${row.source}</strong>
      <div>Trust score: ${row.avg}% | Suspicious share: ${row.suspiciousRate}%</div>
      <small>Signals processed: ${row.total}</small>
    </article>
  `).join("");
};

const renderRegionMisinfoHeat = (rows) => {
  if (!els.regionMisinfoHeat) return;

  els.regionMisinfoHeat.innerHTML = rows.length
    ? rows.map((row) => `
        <article class="region-heat-item ${row.level}">
          <div class="region-heat-head">
            <strong>${row.region}</strong>
            <span class="priority-badge ${row.level === "high" ? "critical" : row.level}">${row.level.toUpperCase()}</span>
          </div>
          <div>Suspicious rate: ${row.suspiciousRate}% (${row.suspicious}/${row.total})</div>
          <small>Avg confidence: ${row.avgConfidence}%</small>
        </article>
      `).join("")
    : "<p class=\"meta\">No region data available for current filters.</p>";
};

const renderRiskRanking = (constituency) => {
  els.riskRanking.innerHTML = "";
  const sorted = [...constituency]
    .sort((a, b) => b.Negative - a.Negative)
    .slice(0, 5);

  sorted.forEach((row, idx) => {
    const negPct = formatPercent(row.Negative, row.total);
    const negVal = parseInt(negPct);
    const riskLevel = negVal >= 60 ? "high" : negVal >= 40 ? "medium" : "low";

    const div = document.createElement("div");
    div.className = `risk-item ${riskLevel}`;
    div.innerHTML = `
      <strong>${idx + 1}. ${row.name}</strong>
      <div>Negative: ${negPct} | Total signals: ${row.total}</div>
      <small>Confidence avg: ${row.avgConfidence}%</small>
    `;
    els.riskRanking.appendChild(div);
  });
};

const renderConfidenceMetrics = (filtered) => {
  els.confidenceMetrics.innerHTML = "";
  
  const avgConfidence = filtered.length 
    ? (filtered.reduce((sum, e) => sum + e.confidence, 0) / filtered.length).toFixed(1)
    : 0;
    
  const highConfidenceCount = filtered.filter(e => e.confidence >= 80).length;
  const lowConfidenceCount = filtered.filter(e => e.confidence < 60).length;

  els.confidenceMetrics.innerHTML = `
    <div class="metric-row">
      <span class="metric-label">Average Confidence</span>
      <span class="metric-value">${avgConfidence}%</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">High Confidence (≥80%)</span>
      <span class="metric-value">${highConfidenceCount}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Low Confidence (<60%)</span>
      <span class="metric-value">${lowConfidenceCount}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Data Quality</span>
      <span class="metric-value confidence-badge ${avgConfidence >= 75 ? 'high' : avgConfidence >= 65 ? 'medium' : 'low'}">
        ${avgConfidence >= 75 ? 'Excellent' : avgConfidence >= 65 ? 'Good' : 'Fair'}
      </span>
    </div>
  `;
};

const renderConstituencies = (summary) => {
  els.constituencyCards.innerHTML = "";
  summary
    .sort((a, b) => b.Negative - a.Negative)
    .slice(0, 8)
    .forEach((row) => {
      const card = document.createElement("article");
      card.className = "constituency-card";
      card.innerHTML = `
        <h4>${row.name}</h4>
        <p>Total: ${row.total} | Avg confidence: ${row.avgConfidence}%</p>
        <small>Positive ${formatPercent(row.Positive, row.total)} • Negative ${formatPercent(row.Negative, row.total)}</small>
      `;
      els.constituencyCards.appendChild(card);
    });
};

const renderBoothInsight = (boothId, filtered) => {
  const insight = simulator.boothInsight(boothId, filtered);
  const complaints = insight.topComplaints.map(([issue, count]) => `${issue} (${count})`).join(", ") || "No major complaint pattern";

  els.boothInsightContent.innerHTML = `
    <strong>Booth ${insight.boothId}</strong>
    <div>Total records: ${insight.total}</div>
    <div>Breakdown: Positive ${insight.breakdown.Positive}, Negative ${insight.breakdown.Negative}, Neutral ${insight.breakdown.Neutral}</div>
    <div>Top complaints: ${complaints}</div>
    <div>Suggested campaign action: ${insight.action}</div>
  `;
};

const renderReplayMeta = (history) => {
  els.timelineSlider.max = String(Math.max(0, history.length - 1));
  els.timelineSlider.value = ui.replayIndex == null ? String(history.length - 1) : String(ui.replayIndex);

  if (!history.length || ui.replayIndex == null || ui.replayIndex === history.length - 1) {
    els.timelineStamp.textContent = "Latest";
    return null;
  }

  const snap = history[ui.replayIndex];
  els.timelineStamp.textContent = new Date(snap.timestamp).toLocaleString();
  return snap;
};

const buildWarRoomText = () => {
  if (!ui.reportSnapshot) return "No report snapshot available.";

  const { meta, totals, issues, strategies, riskConstituencies, misinfo, advisories } = ui.reportSnapshot;
  return [
    "SentimentX - Misinformation Control Report",
    `Generated: ${meta.generatedAt}`,
    `Seed: ${meta.seed}`,
    `Scope: ${meta.scope}`,
    `Records: ${totals.total} | Positive: ${totals.positivePct} | Negative: ${totals.negativePct} | Neutral: ${totals.neutralPct}`,
    `Suspicious signal rate: ${misinfo.suspiciousRate}% | High-risk rumor flags: ${misinfo.highRisk}`,
    "",
    "Top Issues:",
    ...issues.map((x) => `- ${x}`),
    "",
    "Voter Awareness Advisory:",
    ...advisories.map((x) => `- ${x}`),
    "",
    "Immediate Strategy:",
    ...strategies.map((x) => `- ${x}`),
    "",
    "Constituencies At Risk:",
    ...riskConstituencies.map((x) => `- ${x}`)
  ].join("\n");
};

const renderWarRoomReport = ({ filtered, breakdown, issues, strategies, constituency, seed, misinfoSummary, advisories }) => {
  const total = breakdown.Positive + breakdown.Negative + breakdown.Neutral;
  const scope = `${ui.filters.language}/${ui.filters.region}/${ui.filters.timeRangeMin}m`;

  const avgConfidence = filtered.length 
    ? (filtered.reduce((sum, e) => sum + e.confidence, 0) / filtered.length).toFixed(1)
    : 0;

  const issueLines = issues.slice(0, 5).map(([issue, count]) => `${issue}: ${count} mentions`);
  const strategyLines = strategies.slice(0, 5);
  const riskRows = [...constituency]
    .sort((a, b) => b.Negative - a.Negative)
    .slice(0, 5)
    .map((row) => {
      const negPct = formatPercent(row.Negative, row.total);
      const negVal = parseInt(negPct);
      const riskLevel = negVal >= 60 ? "high" : negVal >= 40 ? "medium" : "low";
      return { name: row.name, negPct, riskLevel, total: row.total, avgConfidence: row.avgConfidence };
    });

  els.reportMeta.textContent = `Generated ${new Date().toLocaleString()} | Dataset seed ${seed} | Scope ${scope}`;

  els.reportKpis.innerHTML = `
    <div class="kpi-card"><p>Records</p><strong>${filtered.length}</strong></div>
    <div class="kpi-card positive"><p>Positive</p><strong>${formatPercent(breakdown.Positive, total)}</strong></div>
    <div class="kpi-card negative"><p>Negative</p><strong>${formatPercent(breakdown.Negative, total)}</strong></div>
    <div class="kpi-card neutral"><p>Neutral</p><strong>${formatPercent(breakdown.Neutral, total)}</strong></div>
  `;

  els.reportConfidence.innerHTML = `
    <div class="confidence-stat">
      <label>Avg Confidence</label>
      <value>${avgConfidence}%</value>
    </div>
    <div class="confidence-stat">
      <label>Data Quality</label>
      <value class="confidence-badge ${avgConfidence >= 75 ? 'high' : avgConfidence >= 65 ? 'medium' : 'low'}">
        ${avgConfidence >= 75 ? 'Excellent' : avgConfidence >= 65 ? 'Good' : 'Fair'}
      </value>
    </div>
    <div class="confidence-stat">
      <label>High Confidence Signals</label>
      <value>${filtered.filter(e => e.confidence >= 80).length}</value>
    </div>
    <div class="confidence-stat">
      <label>Suspicious Signal Rate</label>
      <value>${misinfoSummary.suspiciousRate}%</value>
    </div>
    <div class="confidence-stat">
      <label>High-Risk Rumor Flags</label>
      <value>${misinfoSummary.riskCounts.high}</value>
    </div>
  `;

  els.reportRiskDetail.innerHTML = riskRows.map((row) => `
    <div class="risk-detail-row ${row.riskLevel}">
      <div>
        <strong>${row.name}</strong><br/>
        <small>Negative: ${row.negPct} | Confidence: ${row.avgConfidence}%</small>
      </div>
    </div>
  `).join("") || "<div style=\"text-align: center; color: var(--muted);\">No risk constituencies detected</div>";

  els.reportIssues.innerHTML = issueLines.map((x) => `<li>${x}</li>`).join("") || "<li>No major issue trend detected.</li>";
  els.reportStrategies.innerHTML = strategyLines.map((x) => `<li>${x}</li>`).join("") || "<li>Maintain current campaign rhythm.</li>";
  els.reportRiskConstituencies.innerHTML = riskRows.map((x) => `<div class=\"constituency-card\">${x.name} - Negative ${x.negPct}</div>`).join("")
    || "<div class=\"constituency-card\">No constituency risk spikes.</div>";

  ui.reportSnapshot = {
    meta: {
      generatedAt: new Date().toLocaleString(),
      seed,
      scope
    },
    totals: {
      total: filtered.length,
      positivePct: formatPercent(breakdown.Positive, total),
      negativePct: formatPercent(breakdown.Negative, total),
      neutralPct: formatPercent(breakdown.Neutral, total)
    },
    confidence: {
      average: avgConfidence,
      dataQuality: avgConfidence >= 75 ? 'Excellent' : avgConfidence >= 65 ? 'Good' : 'Fair'
    },
    misinfo: {
      suspiciousRate: misinfoSummary.suspiciousRate,
      highRisk: misinfoSummary.riskCounts.high
    },
    issues: issueLines,
    advisories,
    strategies: strategyLines,
    riskConstituencies: riskRows.map(r => `${r.name} - Negative ${r.negPct}`)
  };
};

const applyRender = () => {
  const all = simulator.getState();
  const filtered = simulator.getFilteredEntries(ui.filters);
  const breakdown = simulator.sentimentBreakdown(filtered);
  const issueFreq = simulator.issueFrequency(filtered);
  const misinfoSummary = simulator.misinformationSummary(filtered);
  const advisories = simulator.voterAwarenessAdvisory(filtered);
  const regionMisinfoHeat = simulator.regionMisinformationHeat(filtered);
  const groupedBooths = simulator.groupByBooth(filtered);
  const constituency = simulator.constituencySummary(filtered);

  const replaySnap = renderReplayMeta(all.history);
  const effectiveBreakdown = replaySnap ? replaySnap.totals : breakdown;

  const total = effectiveBreakdown.Positive + effectiveBreakdown.Negative + effectiveBreakdown.Neutral;
  els.kpiTotal.textContent = String(filtered.length);
  els.kpiPositive.textContent = formatPercent(effectiveBreakdown.Positive, total);
  els.kpiNegative.textContent = formatPercent(effectiveBreakdown.Negative, total);
  els.kpiNeutral.textContent = formatPercent(effectiveBreakdown.Neutral, total);

  renderFeed(filtered);
  renderStrategies(simulator.generateStrategies(filtered));
  renderIssues(issueFreq);
  renderVoterCorner(filtered, effectiveBreakdown, misinfoSummary);
  renderMisinformationWatch(misinfoSummary);
  renderAwarenessAdvisory(advisories);
  renderFactCheckQueue(filtered, all.clock);
  renderSourceTrustBoard(filtered);
  renderRegionMisinfoHeat(regionMisinfoHeat);
  renderConstituencies(constituency);
  renderRiskRanking(constituency);
  renderConfidenceMetrics(filtered);

  renderHeatmap({
    container: els.heatmapGrid,
    groupedBooths,
    onBoothClick: (boothId) => {
      ui.selectedBoothId = boothId;
      renderBoothInsight(boothId, filtered);
    }
  });

  renderBoothInsight(ui.selectedBoothId, filtered);

  charts.updateSentimentPie(effectiveBreakdown);
  charts.updateTrend(all.history);
  charts.updateIssueBar(issueFreq);
  renderWarRoomReport({
    filtered,
    breakdown: effectiveBreakdown,
    issues: issueFreq,
    strategies: simulator.generateStrategies(filtered),
    constituency,
    seed: all.seed,
    misinfoSummary,
    advisories
  });
};

const onDataUpdate = (state) => {
  const meta = state.lastTickMeta;
  if (meta && meta.negativeRate - ui.prevNegativeRate > 0.18 && meta.boothSpike && meta.boothSpike.negRatio > 0.55) {
    notifyAlert(`Negative spike in Booth ${meta.boothSpike.boothId}`);
  }
  if (meta?.misinfoRate > 35) {
    notifyAlert("Misinformation alert: suspicious signal rate crossed 35%.");
  }
  if (Math.random() < 0.08) {
    const boothNo = 1 + Math.floor(Math.random() * 48);
    notifyAlert(`Field pulse update: activity shift in Booth ${boothNo}`);
  }
  ui.prevNegativeRate = meta?.negativeRate || ui.prevNegativeRate;
  applyRender();
};

const setTab = (tabName) => {
  els.tabLinks.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  setSidebarAccent(tabName);

  els.tabViews.forEach((tab) => {
    tab.classList.toggle("active", tab.id === tabName);
  });

  const target = els.tabViews.find((tab) => tab.id === tabName);
  if (target) {
    const label = els.tabLinks.find((btn) => btn.dataset.tab === tabName)?.textContent?.trim() || "section";
    target.setAttribute("aria-busy", "true");
    els.tabLoadingAnnouncer.textContent = `Loading ${label}`;
    target.classList.add("is-loading");
    setTimeout(() => {
      target.classList.remove("is-loading");
      target.setAttribute("aria-busy", "false");
      els.tabLoadingAnnouncer.textContent = `${label} loaded`;
    }, 260);
  }

  const active = els.tabLinks.find((btn) => btn.dataset.tab === tabName);
  els.activeTabTitle.textContent = active ? active.textContent : "Overview";
};

const bindTabs = () => {
  els.tabLinks.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTab(btn.dataset.tab);
      els.appShell.classList.remove("menu-open");
    });
  });
};

const bindFactCheckActions = () => {
  if (!els.factCheckQueue) return;

  els.factCheckQueue.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-generate-myth]");
    if (!btn) return;

    const claimId = btn.getAttribute("data-generate-myth");
    if (!claimId) return;

    ui.selectedClaimId = claimId;
    renderMythFactCard(ui.factCheckLookup.get(claimId), true);
  });
};

const bindMythFactModal = () => {
  if (!els.mythFactOverlay || !els.mythFactCloseBtn) return;

  const closeModal = () => {
    els.mythFactOverlay.classList.remove("open");
    els.mythFactOverlay.setAttribute("aria-hidden", "true");
  };

  els.mythFactCloseBtn.addEventListener("click", closeModal);
  els.mythFactOverlay.addEventListener("click", (event) => {
    if (event.target === els.mythFactOverlay) closeModal();
  });
};

const bindFilters = () => {
  const onFilter = debounce(() => {
    ui.filters.language = els.languageFilter.value;
    ui.filters.region = els.regionFilter.value;
    ui.filters.timeRangeMin = Number(els.timeFilter.value);
    applyRender();
  });

  [els.languageFilter, els.regionFilter, els.timeFilter].forEach((el) => {
    el.addEventListener("change", onFilter);
  });
};

const bindControls = () => {
  els.themeToggle.addEventListener("click", () => {
    const next = document.body.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
  });

  els.demoModeToggle.addEventListener("click", () => {
    const next = simulator.demoMode === "high" ? "low" : "high";
    setDemoMode(next);
  });

  els.timelineSlider.addEventListener("input", debounce(() => {
    const idx = Number(els.timelineSlider.value);
    const max = Number(els.timelineSlider.max);
    ui.replayIndex = idx >= max ? null : idx;
    applyRender();
  }, 30));

  els.exportCsvBtn.addEventListener("click", () => {
    const rows = simulator.getFilteredEntries(ui.filters);
    const head = ["id", "timestamp", "source", "region", "language", "constituency", "boothId", "sentiment", "confidence", "issue", "text"];
    const csv = [
      head.join(","),
      ...rows.map((r) => head.map((key) => `"${String(r[key]).replaceAll("\"", "\"\"")}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentiment-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  els.warRoomBtn.addEventListener("click", () => {
    els.warRoomOverlay.classList.add("open");
    els.warRoomOverlay.setAttribute("aria-hidden", "false");
  });

  els.reportCloseBtn.addEventListener("click", () => {
    els.warRoomOverlay.classList.remove("open");
    els.warRoomOverlay.setAttribute("aria-hidden", "true");
  });

  els.reportPrintBtn.addEventListener("click", () => {
    document.body.classList.add("print-war-room");
    window.print();
  });

  els.reportExportBtn.addEventListener("click", () => {
    const text = buildWarRoomText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `war-room-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  window.addEventListener("afterprint", () => {
    document.body.classList.remove("print-war-room");
  });
};

const bindAssistantMode = () => {
  els.modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      ui.chatMode = btn.dataset.mode;
      els.modeButtons.forEach((node) => node.classList.toggle("active", node === btn));
    });
  });
};

const bindFloatingWidget = () => {
  els.chatFab.addEventListener("click", () => {
    const open = els.chatWidget.classList.toggle("open");
    els.chatWidget.setAttribute("aria-hidden", open ? "false" : "true");
  });

  els.chatWidgetClose.addEventListener("click", () => {
    els.chatWidget.classList.remove("open");
    els.chatWidget.setAttribute("aria-hidden", "true");
  });
};

const bindMenuToggle = () => {
  els.menuToggle.addEventListener("click", () => {
    els.appShell.classList.toggle("menu-open");
  });

  els.sidebarBackdrop.addEventListener("click", () => {
    els.appShell.classList.remove("menu-open");
  });
};

const bindSidebarCollapse = () => {
  if (!els.sidebarCollapseToggle) return;

  els.sidebarCollapseToggle.addEventListener("click", () => {
    const collapsed = els.appShell.classList.toggle("sidebar-collapsed");
    els.sidebarCollapseToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    els.sidebarCollapseToggle.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
    els.sidebarCollapseToggle.setAttribute("title", collapsed ? "Expand sidebar" : "Collapse sidebar");
  });
};

const init = () => {
  charts.init();

  const theme = storage.getTheme();
  setTheme(theme);

  const mode = storage.getDemoMode();
  setDemoMode(mode);

  bindTabs();
  setSidebarAccent("overview");
  bindSidebarCollapse();
  bindMenuToggle();
  bindFilters();
  bindControls();
  bindFactCheckActions();
  bindMythFactModal();
  bindAssistantMode();
  bindFloatingWidget();

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  chatbot.setDataProvider(() => simulator.getFilteredEntries(ui.filters));

  attachChatUI({
    form: els.assistantForm,
    input: els.assistantInput,
    messagesBox: els.assistantMessages,
    chatbot,
    getMode: () => ui.chatMode
  });

  attachChatUI({
    form: els.widgetForm,
    input: els.widgetInput,
    messagesBox: els.widgetMessages,
    chatbot,
    getMode: () => ui.chatMode
  });

  simulator.onUpdate(onDataUpdate);
  applyRender();
  simulator.start();
};

init();
