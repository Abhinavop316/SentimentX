const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {
      labels: {
        color: "#60706a"
      }
    }
  },
  scales: {
    x: {
      ticks: { color: "#60706a" },
      grid: { color: "rgba(130,130,130,0.12)" }
    },
    y: {
      ticks: { color: "#60706a" },
      grid: { color: "rgba(130,130,130,0.12)" }
    }
  }
};

const toTimeLabel = (ts) => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export class DashboardCharts {
  constructor() {
    this.pie = null;
    this.line = null;
    this.bar = null;
  }

  init() {
    const pieCtx = document.getElementById("sentimentPie");
    const lineCtx = document.getElementById("trendLine");
    const barCtx = document.getElementById("issueBar");

    this.pie = new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["Positive", "Negative", "Neutral"],
        datasets: [{
          data: [1, 1, 1],
          backgroundColor: ["#10b981", "#ff4d4f", "#f59e0b"],
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.35)"
        }]
      },
      options: {
        ...chartDefaults,
        scales: {}
      }
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
            fill: true
          },
          {
            label: "Negative",
            data: [],
            borderColor: "#ff4d4f",
            backgroundColor: "rgba(255,77,79,0.08)",
            tension: 0.3,
            fill: true
          },
          {
            label: "Neutral",
            data: [],
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245,158,11,0.08)",
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: chartDefaults
    });

    this.bar = new Chart(barCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [{
          label: "Issue Mentions",
          data: [],
          backgroundColor: ["#00b09b", "#ff7a18", "#95ff5f", "#f59e0b", "#10b981", "#f87171", "#14b8a6", "#84cc16"]
        }]
      },
      options: chartDefaults
    });
  }

  updateSentimentPie(breakdown) {
    if (!this.pie) return;
    this.pie.data.datasets[0].data = [breakdown.Positive, breakdown.Negative, breakdown.Neutral];
    this.pie.update("none");
  }

  updateTrend(history) {
    if (!this.line) return;

    const sampled = history.slice(-18);
    this.line.data.labels = sampled.map((x) => toTimeLabel(x.timestamp));
    this.line.data.datasets[0].data = sampled.map((x) => x.totals.Positive);
    this.line.data.datasets[1].data = sampled.map((x) => x.totals.Negative);
    this.line.data.datasets[2].data = sampled.map((x) => x.totals.Neutral);
    this.line.update("none");
  }

  updateIssueBar(freqEntries) {
    if (!this.bar) return;
    this.bar.data.labels = freqEntries.map(([issue]) => issue);
    this.bar.data.datasets[0].data = freqEntries.map(([, count]) => count);
    this.bar.update("none");
  }
}
