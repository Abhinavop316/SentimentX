const LANGUAGES = ["English", "Hindi", "Hinglish"];
const REGIONS = ["North", "South", "East", "West", "Central"];
const SOURCES = ["Social", "News", "Survey"];

const LEXICON = {
  Positive: [
    "development",
    "progress",
    "jobs",
    "trust",
    "improved",
    "support",
    "badhia",
    "accha",
    "vikas",
    "majboot",
    "growth",
    "relief"
  ],
  Negative: [
    "corruption",
    "inflation",
    "anger",
    "protest",
    "crime",
    "water crisis",
    "mehengaai",
    "bekaar",
    "naraz",
    "berozgari",
    "delay",
    "unrest"
  ],
  Neutral: ["meeting", "statement", "visit", "campaign", "speech", "discussion", "survey", "report"]
};

const TEXT_BANK = {
  English: {
    Positive: [
      "Road development has improved commute in my area",
      "People are happy with new jobs initiative",
      "Healthcare support feels stronger this quarter"
    ],
    Negative: [
      "Inflation pressure is hurting daily households",
      "Water supply issue is still unresolved",
      "Corruption allegations are raising anger"
    ],
    Neutral: [
      "Candidate held a public meeting in market zone",
      "Survey team visited ward offices today",
      "News report covered policy speech"
    ]
  },
  Hindi: {
    Positive: [
      "Sadak aur bijli mein sudhar se log khush hain",
      "Yuvaon ko rojgar yojna se fayda mila",
      "Swasthya sevaon mein behtar pradarshan dikh raha hai"
    ],
    Negative: [
      "Mehengaai se parivar par bojh badh raha hai",
      "Pani ki samasya par narazgi badh rahi hai",
      "Berozgari ko lekar booth star par shikayatein hain"
    ],
    Neutral: [
      "Neta ne aaj jan sabha mein bhashan diya",
      "Karyakartaon ne survey data collect kiya",
      "Media ne chunavi muddon par report dikhayi"
    ]
  },
  Hinglish: {
    Positive: [
      "Ground pe vibe kaafi positive hai after vikas push",
      "Log bol rahe hain campaign ka outreach accha hai",
      "Youth ko jobs update se confidence mila"
    ],
    Negative: [
      "Local area mein inflation aur bills pe gussa hai",
      "Public ko lag raha hai promises delay ho rahe hain",
      "Water issue pe log kaafi naraz dikh rahe hain"
    ],
    Neutral: [
      "Aaj constituency mein normal campaign walk hua",
      "Team ne mixed feedback collect kiya",
      "Debate event mein sab parties ne points rakhe"
    ]
  }
};

const ISSUE_KEYWORDS = [
  "inflation",
  "water",
  "jobs",
  "roads",
  "corruption",
  "safety",
  "health",
  "electricity",
  "education",
  "transport"
];

const MISINFO_TERMS = [
  "fake",
  "viral",
  "rumor",
  "forwards",
  "forwarded",
  "breaking",
  "leaked",
  "boycott",
  "evm hacked",
  "vote cancelled"
];

const DEFAULT_SEED = 20260317;

class SeededRng {
  constructor(seed = DEFAULT_SEED) {
    this.seed = seed >>> 0;
  }

  next() {
    this.seed += 0x6d2b79f5;
    let t = this.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick(arr) {
    return arr[this.int(0, arr.length - 1)];
  }

  idChunk(length = 6) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    for (let i = 0; i < length; i += 1) {
      out += chars[this.int(0, chars.length - 1)];
    }
    return out;
  }
}

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-zA-Z\u0900-\u097F\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

export class SentimentEngine {
  analyze(text, language, randomValue = Math.random) {
    const words = tokenize(text);
    let pos = 0;
    let neg = 0;
    let neu = 0;

    words.forEach((word) => {
      if (LEXICON.Positive.some((t) => t.includes(word) || word.includes(t))) pos += 1;
      if (LEXICON.Negative.some((t) => t.includes(word) || word.includes(t))) neg += 1;
      if (LEXICON.Neutral.some((t) => t.includes(word) || word.includes(t))) neu += 1;
    });

    const langBias = language === "Hindi" ? 0.05 : language === "Hinglish" ? 0.08 : 0.03;
    const randomWeight = randomValue() * 0.28;
    const score = (pos * 0.9 + randomWeight) - (neg * (0.92 + langBias)) + neu * 0.05;

    let sentiment = "Neutral";
    if (score > 0.26) sentiment = "Positive";
    if (score < -0.24) sentiment = "Negative";

    const confidenceBase = Math.min(0.95, Math.max(0.52, 0.6 + Math.abs(score) * 0.33 + randomValue() * 0.12));
    return {
      sentiment,
      confidence: Number((confidenceBase * 100).toFixed(1)),
      score: Number(score.toFixed(3))
    };
  }
}

export class DataSimulator {
  constructor(seed = DEFAULT_SEED) {
    this.engine = new SentimentEngine();
    this.seed = seed;
    this.rng = new SeededRng(seed);
    this.entries = [];
    this.history = [];
    this.lastTickMeta = null;
    this.demoMode = "low";
    this.lowTickMs = 7600;
    this.highTickMs = 2400;
    this.clock = Date.now();
    this.listeners = [];
    this.intervalRef = null;
    this.seedInitialData();
  }

  seedInitialData() {
    for (let i = 0; i < 40; i += 1) {
      this.entries.unshift(this.createEntry(this.clock - this.rng.int(12000, 7200000)));
    }
    this.captureSnapshot();
  }

  createEntry(timestamp = this.clock) {
    const language = this.rng.pick(LANGUAGES);
    const region = this.rng.pick(REGIONS);
    const source = this.rng.pick(SOURCES);

    let sentimentHint = this.rng.pick(["Positive", "Negative", "Neutral"]);
    if (source === "Survey" && this.rng.next() > 0.62) sentimentHint = "Negative";
    if (source === "News" && this.rng.next() > 0.6) sentimentHint = "Neutral";

    const text = this.rng.pick(TEXT_BANK[language][sentimentHint]);
    const analyzed = this.engine.analyze(text, language, () => this.rng.next());

    return {
      id: `${timestamp}-${this.rng.idChunk(6)}`,
      timestamp,
      source,
      region,
      language,
      boothId: this.rng.int(1, 48),
      constituency: `${region} Constituency ${this.rng.int(1, 6)}`,
      text,
      sentiment: analyzed.sentiment,
      confidence: analyzed.confidence,
      score: analyzed.score,
      issue: this.pickIssue(text)
    };
  }

  pickIssue(text) {
    const lower = text.toLowerCase();
    const direct = ISSUE_KEYWORDS.find((word) => lower.includes(word));
    if (direct) return direct;

    if (lower.includes("mehengaai")) return "inflation";
    if (lower.includes("pani")) return "water";
    if (lower.includes("rojgar") || lower.includes("berozgari")) return "jobs";
    if (lower.includes("sadak")) return "roads";

    return this.rng.pick(ISSUE_KEYWORDS);
  }

  start() {
    this.stop();
    const delay = this.demoMode === "high" ? this.highTickMs : this.lowTickMs;
    this.intervalRef = setInterval(() => {
      this.tick();
    }, delay);
  }

  stop() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  setDemoMode(mode) {
    this.demoMode = mode;
    this.start();
  }

  tick() {
    const insertCount = this.demoMode === "high" ? this.rng.int(2, 5) : 1;
    this.clock += this.demoMode === "high" ? this.highTickMs : this.lowTickMs;
    const incoming = [];

    for (let i = 0; i < insertCount; i += 1) {
      const entry = this.createEntry();
      this.entries.unshift(entry);
      incoming.push(entry);
    }

    this.entries = this.entries.slice(0, 700);
    this.lastTickMeta = this.buildTickMeta(incoming);
    this.captureSnapshot();
    this.emit();
  }

  buildTickMeta(incoming) {
    const recent = this.entries.slice(0, 30);
    const negativeRate = recent.length
      ? recent.filter((e) => e.sentiment === "Negative").length / recent.length
      : 0;
    const misinfoRate = this.misinformationSummary(recent).suspiciousRate;

    let boothSpike = null;
    const byBooth = this.groupByBooth(incoming);
    byBooth.forEach((v, boothId) => {
      const negRatio = v.total ? v.Negative / v.total : 0;
      if (!boothSpike || negRatio > boothSpike.negRatio) {
        boothSpike = { boothId, negRatio };
      }
    });

    return {
      negativeRate,
      misinfoRate,
      boothSpike
    };
  }

  captureSnapshot() {
    const now = this.clock;
    const recent = this.entries.filter((e) => now - e.timestamp <= 24 * 60 * 60 * 1000);
    const count = { Positive: 0, Negative: 0, Neutral: 0 };
    recent.forEach((entry) => {
      count[entry.sentiment] += 1;
    });

    this.history.push({
      timestamp: now,
      totals: count
    });

    this.history = this.history.slice(-240);
  }

  onUpdate(listener) {
    this.listeners.push(listener);
  }

  emit() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  getState() {
    return {
      entries: [...this.entries],
      history: [...this.history],
      demoMode: this.demoMode,
      seed: this.seed,
      clock: this.clock,
      lastTickMeta: this.lastTickMeta
    };
  }

  getFilteredEntries(filters) {
    const now = this.clock;
    const timeMs = Number(filters.timeRangeMin) * 60 * 1000;

    return this.entries.filter((entry) => {
      const languageOk = filters.language === "all" || entry.language === filters.language;
      const regionOk = filters.region === "all" || entry.region === filters.region;
      const timeOk = now - entry.timestamp <= timeMs;
      return languageOk && regionOk && timeOk;
    });
  }

  sentimentBreakdown(entries) {
    const count = { Positive: 0, Negative: 0, Neutral: 0 };
    entries.forEach((entry) => {
      count[entry.sentiment] += 1;
    });
    return count;
  }

  issueFrequency(entries) {
    const map = new Map();
    entries.forEach((entry) => {
      map.set(entry.issue, (map.get(entry.issue) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }

  isSuspiciousEntry(entry) {
    const text = entry.text.toLowerCase();
    const keywordHit = MISINFO_TERMS.some((term) => text.includes(term));
    const weakConfidence = entry.confidence < 66;
    const sourceRisk = entry.source === "Social" && entry.sentiment === "Negative";
    return keywordHit || weakConfidence || sourceRisk;
  }

  misinformationSummary(entries) {
    const suspicious = entries.filter((entry) => this.isSuspiciousEntry(entry));

    const riskCounts = { high: 0, medium: 0, low: 0 };
    suspicious.forEach((entry) => {
      if (entry.confidence < 58) riskCounts.high += 1;
      else if (entry.confidence < 70) riskCounts.medium += 1;
      else riskCounts.low += 1;
    });

    const narrativeMap = new Map();
    suspicious.forEach((entry) => {
      narrativeMap.set(entry.issue, (narrativeMap.get(entry.issue) || 0) + 1);
    });

    const topNarratives = [...narrativeMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    const verifiedLikely = Math.max(entries.length - suspicious.length, 0);

    return {
      totalSignals: entries.length,
      suspiciousCount: suspicious.length,
      suspiciousRate: entries.length ? Number(((suspicious.length / entries.length) * 100).toFixed(1)) : 0,
      verifiedLikely,
      riskCounts,
      topNarratives
    };
  }

  regionMisinformationHeat(entries) {
    const regionMap = new Map();

    entries.forEach((entry) => {
      const row = regionMap.get(entry.region) || { total: 0, suspicious: 0, avgConfidence: 0 };
      row.total += 1;
      row.avgConfidence += entry.confidence;
      if (this.isSuspiciousEntry(entry)) row.suspicious += 1;
      regionMap.set(entry.region, row);
    });

    return [...regionMap.entries()]
      .map(([region, row]) => {
        const suspiciousRate = row.total ? Math.round((row.suspicious / row.total) * 100) : 0;
        const level = suspiciousRate >= 40 ? "high" : suspiciousRate >= 25 ? "medium" : "low";
        return {
          region,
          total: row.total,
          suspicious: row.suspicious,
          suspiciousRate,
          level,
          avgConfidence: Number((row.avgConfidence / Math.max(row.total, 1)).toFixed(1))
        };
      })
      .sort((a, b) => b.suspiciousRate - a.suspiciousRate);
  }

  voterAwarenessAdvisory(entries) {
    const issues = this.issueFrequency(entries).slice(0, 3).map(([issue]) => issue);
    const misinfo = this.misinformationSummary(entries);
    const advisories = [
      "Verify election-related claims from official EC/CEO channels before sharing.",
      "Use booth-level helpdesks and voter helplines for procedural clarifications."
    ];

    if (misinfo.suspiciousRate > 32) {
      advisories.push("High rumor velocity detected. Trigger rapid myth-vs-fact messaging in affected wards.");
    } else {
      advisories.push("Misinformation pressure is moderate. Maintain steady fact-check communication cadence.");
    }

    if (issues.length) {
      advisories.push(`Prioritize awareness messaging around: ${issues.join(", ")}.`);
    }

    return advisories.slice(0, 4);
  }

  groupByBooth(entries) {
    const map = new Map();
    entries.forEach((entry) => {
      const key = entry.boothId;
      const existing = map.get(key) || { total: 0, Positive: 0, Negative: 0, Neutral: 0, complaints: [] };
      existing.total += 1;
      existing[entry.sentiment] += 1;
      if (entry.sentiment === "Negative") existing.complaints.push(entry.issue);
      map.set(key, existing);
    });
    return map;
  }

  constituencySummary(entries) {
    const map = new Map();
    entries.forEach((entry) => {
      const key = entry.constituency;
      const row = map.get(key) || { total: 0, Positive: 0, Negative: 0, Neutral: 0, avgConfidence: 0 };
      row.total += 1;
      row[entry.sentiment] += 1;
      row.avgConfidence += entry.confidence;
      map.set(key, row);
    });

    return [...map.entries()].map(([name, row]) => ({
      name,
      total: row.total,
      Positive: row.Positive,
      Negative: row.Negative,
      Neutral: row.Neutral,
      avgConfidence: Number((row.avgConfidence / Math.max(row.total, 1)).toFixed(1))
    }));
  }

  generateStrategies(entries) {
    const byRegion = new Map();
    entries.forEach((entry) => {
      const row = byRegion.get(entry.region) || { total: 0, negative: 0 };
      row.total += 1;
      if (entry.sentiment === "Negative") row.negative += 1;
      byRegion.set(entry.region, row);
    });

    const ideas = [];
    byRegion.forEach((row, region) => {
      const ratio = row.total ? row.negative / row.total : 0;
      if (ratio > 0.42) ideas.push(`Increase outreach in ${region} zone with ward-level listening sessions.`);
      if (ratio > 0.35) ideas.push(`Deploy rapid response team in ${region} for issue handling.`);
    });

    const topIssues = this.issueFrequency(entries).slice(0, 3).map(([issue]) => issue);
    topIssues.forEach((issue) => {
      ideas.push(`Focus campaign communication on ${issue} with concrete 30-day action plan.`);
    });

    if (!ideas.length) ideas.push("Current sentiment stable. Reinforce positive narratives and volunteer mobilization.");
    return ideas.slice(0, 5);
  }

  boothInsight(boothId, entries) {
    const boothEntries = entries.filter((entry) => entry.boothId === boothId);
    const breakdown = this.sentimentBreakdown(boothEntries);
    const complaints = this.issueFrequency(boothEntries.filter((e) => e.sentiment === "Negative"));
    const topComplaint = complaints[0]?.[0] || "service responsiveness";

    let action = `Hold focused booth meeting in Booth ${boothId} and close loop on feedback within 72 hours.`;
    if (topComplaint === "inflation") action = `Push targeted subsidy messaging in Booth ${boothId} and engage local traders.`;
    if (topComplaint === "water") action = `Announce booth-level water grievance camps for Booth ${boothId}.`;
    if (topComplaint === "jobs") action = `Run youth employment helpdesk activation in Booth ${boothId}.`;

    return {
      boothId,
      total: boothEntries.length,
      breakdown,
      topComplaints: complaints.slice(0, 3),
      action
    };
  }
}
