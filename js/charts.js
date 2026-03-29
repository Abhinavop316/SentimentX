const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {
      labels: {
        color: "#60706a",
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#60706a" },
      grid: { color: "rgba(130,130,130,0.12)" },
    },
    y: {
      ticks: { color: "#60706a" },
      grid: { color: "rgba(130,130,130,0.12)" },
    },
  },
};

const toTimeLabel = (ts) => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const hasChartLibrary = () =>
  typeof window !== "undefined" && typeof window.Chart === "function";

const withCanvasContext = (canvas) => {
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(320, Math.floor(rect.width || 320));
  canvas.height = Math.max(220, Math.floor(rect.height || 220));
  return canvas.getContext("2d");
};

const drawFallbackLegend = (ctx, labels, colors) => {
  ctx.save();
  ctx.font = "12px Manrope, sans-serif";
  ctx.textBaseline = "middle";
  labels.forEach((label, idx) => {
    const x = 16 + idx * 105;
    const y = 18;
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fillRect(x, y - 5, 10, 10);
    ctx.fillStyle = "#60706a";
    ctx.fillText(label, x + 16, y);
  });
  ctx.restore();
};

const drawFallbackPie = (ctx, values) => {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const colors = ["#10b981", "#ff4d4f", "#f59e0b"];
  const labels = ["Positive", "Negative", "Neutral"];

  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const cx = w / 2;
  const cy = h / 2 + 10;
  const r = Math.min(w, h) * 0.28;

  ctx.clearRect(0, 0, w, h);
  drawFallbackLegend(ctx, labels, colors);

  let start = -Math.PI / 2;
  values.forEach((value, idx) => {
    const arc = (value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + arc);
    ctx.closePath();
    ctx.fillStyle = colors[idx];
    ctx.fill();
    start += arc;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.52, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
};

const drawFallbackLine = (ctx, history) => {
  const points = history.slice(-18);
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const pad = { l: 36, r: 18, t: 24, b: 24 };
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;

  ctx.clearRect(0, 0, w, h);
  drawFallbackLegend(
    ctx,
    ["Positive", "Negative", "Neutral"],
    ["#10b981", "#ff4d4f", "#f59e0b"],
  );

  const maxY = Math.max(
    10,
    ...points.map((p) =>
      Math.max(p.totals.Positive, p.totals.Negative, p.totals.Neutral),
    ),
  );

  const drawSeries = (color, getY) => {
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = pad.l + (i / Math.max(1, points.length - 1)) * chartW;
      const y = pad.t + chartH - (getY(p) / maxY) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  drawSeries("#10b981", (p) => p.totals.Positive);
  drawSeries("#ff4d4f", (p) => p.totals.Negative);
  drawSeries("#f59e0b", (p) => p.totals.Neutral);
};

const drawFallbackBar = (ctx, freqEntries) => {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const pad = { l: 20, r: 20, t: 28, b: 40 };
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;
  const colors = [
    "#00b09b",
    "#ff7a18",
    "#95ff5f",
    "#f59e0b",
    "#10b981",
    "#f87171",
    "#14b8a6",
    "#84cc16",
  ];

  ctx.clearRect(0, 0, w, h);
  const entries = freqEntries.slice(0, 8);
  const maxY = Math.max(1, ...entries.map(([, count]) => count));
  const barW = chartW / Math.max(1, entries.length) - 8;

  ctx.save();
  ctx.font = "11px Manrope, sans-serif";
  ctx.fillStyle = "#60706a";

  entries.forEach(([label, count], idx) => {
    const x = pad.l + idx * (barW + 8);
    const barH = (count / maxY) * chartH;
    const y = pad.t + chartH - barH;
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = "#60706a";
    ctx.fillText(label.slice(0, 8), x, h - 18);
  });
  ctx.restore();
};

export class DashboardCharts {
  constructor() {
    this.pie = null;
    this.line = null;
    this.bar = null;
    this.fallback = {
      pieCtx: null,
      lineCtx: null,
      barCtx: null,
    };
    this.usingFallback = false;
  }

  init() {
    const pieCtx = document.getElementById("sentimentPie");
    const lineCtx = document.getElementById("trendLine");
    const barCtx = document.getElementById("issueBar");

    if (!hasChartLibrary()) {
      this.usingFallback = true;
      this.fallback.pieCtx = withCanvasContext(pieCtx);
      this.fallback.lineCtx = withCanvasContext(lineCtx);
      this.fallback.barCtx = withCanvasContext(barCtx);
      drawFallbackPie(this.fallback.pieCtx, [1, 1, 1]);
      drawFallbackLine(this.fallback.lineCtx, []);
      drawFallbackBar(this.fallback.barCtx, []);
      return;
    }

    this.pie = new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["Positive", "Negative", "Neutral"],
        datasets: [
          {
            data: [1, 1, 1],
            backgroundColor: ["#10b981", "#ff4d4f", "#f59e0b"],
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.35)",
          },
        ],
      },
      options: {
        ...chartDefaults,
        scales: {},
      },
    });

    this.line = new Chart(lineCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Positive",
            data: [],
            borderColor: "#10b981",
            backgroundColor: "rgba(16,185,129,0.14)",
            tension: 0.3,
            fill: true,
          },
          {
            label: "Negative",
            data: [],
            borderColor: "#ff4d4f",
            backgroundColor: "rgba(255,77,79,0.08)",
            tension: 0.3,
            fill: true,
          },
          {
            label: "Neutral",
            data: [],
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245,158,11,0.08)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: chartDefaults,
    });

    this.bar = new Chart(barCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Issue Mentions",
            data: [],
            backgroundColor: [
              "#00b09b",
              "#ff7a18",
              "#95ff5f",
              "#f59e0b",
              "#10b981",
              "#f87171",
              "#14b8a6",
              "#84cc16",
            ],
          },
        ],
      },
      options: chartDefaults,
    });
  }

  updateSentimentPie(breakdown) {
    if (this.usingFallback && this.fallback.pieCtx) {
      drawFallbackPie(this.fallback.pieCtx, [
        breakdown.Positive,
        breakdown.Negative,
        breakdown.Neutral,
      ]);
      return;
    }

    if (!this.pie) return;
    this.pie.data.datasets[0].data = [
      breakdown.Positive,
      breakdown.Negative,
      breakdown.Neutral,
    ];
    this.pie.update("none");
  }

  updateTrend(history) {
    if (this.usingFallback && this.fallback.lineCtx) {
      drawFallbackLine(this.fallback.lineCtx, history);
      return;
    }

    if (!this.line) return;

    const sampled = history.slice(-18);
    this.line.data.labels = sampled.map((x) => toTimeLabel(x.timestamp));
    this.line.data.datasets[0].data = sampled.map((x) => x.totals.Positive);
    this.line.data.datasets[1].data = sampled.map((x) => x.totals.Negative);
    this.line.data.datasets[2].data = sampled.map((x) => x.totals.Neutral);
    this.line.update("none");
  }

  updateIssueBar(freqEntries) {
    if (this.usingFallback && this.fallback.barCtx) {
      drawFallbackBar(this.fallback.barCtx, freqEntries);
      return;
    }

    if (!this.bar) return;
    this.bar.data.labels = freqEntries.map(([issue]) => issue);
    this.bar.data.datasets[0].data = freqEntries.map(([, count]) => count);
    this.bar.update("none");
  }
}
