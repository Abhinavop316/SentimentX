const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sentimentPercent = (items, target) => {
  if (!items.length) return 0;
  const count = items.filter((item) => item.sentiment === target).length;
  return Math.round((count / items.length) * 100);
};

const pickModeTone = (mode) => {
  if (mode === "gemini") {
    return {
      prefix: "Gemini Insight",
      style: "Scenario-oriented"
    };
  }
  return {
    prefix: "ChatGPT Insight",
    style: "Action-first"
  };
};

export class PoliticalChatbot {
  constructor() {
    this.mode = "chatgpt";
    this.dataProvider = () => [];
  }

  setMode(mode) {
    this.mode = mode;
  }

  setDataProvider(provider) {
    this.dataProvider = provider;
  }

  detectConstituency(query, entries) {
    const low = query.toLowerCase();
    const names = [...new Set(entries.map((entry) => entry.constituency))];
    return names.find((name) => low.includes(name.toLowerCase()));
  }

  summarize(entries, constituency) {
    const pool = constituency ? entries.filter((entry) => entry.constituency === constituency) : entries;
    const pos = sentimentPercent(pool, "Positive");
    const neg = sentimentPercent(pool, "Negative");
    const neu = sentimentPercent(pool, "Neutral");

    const issuesMap = new Map();
    pool.forEach((entry) => {
      issuesMap.set(entry.issue, (issuesMap.get(entry.issue) || 0) + 1);
    });

    const topIssues = [...issuesMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);

    return {
      total: pool.length,
      pos,
      neg,
      neu,
      topIssues
    };
  }

  buildAnswer(query) {
    const entries = this.dataProvider();
    const constituency = this.detectConstituency(query, entries);
    const summary = this.summarize(entries, constituency);
    const tone = pickModeTone(this.mode);

    const place = constituency || "the selected scope";
    let guidance = "Maintain narrative momentum and continue rapid grievance resolution.";
    if (summary.neg >= 42) guidance = "Trigger booth-level corrective campaign and issue-specific outreach in 48 hours.";
    if (summary.topIssues.includes("inflation")) guidance = "Prioritize inflation relief messaging and local affordability actions.";
    if (summary.topIssues.includes("water")) guidance = "Announce visible water access interventions and publish delivery timeline.";

    return `${tone.prefix}: In ${place}, sentiment is ${summary.pos}% Positive, ${summary.neg}% Negative, and ${summary.neu}% Neutral from ${summary.total} records. Top issues: ${summary.topIssues.join(", ") || "none"}. ${tone.style} recommendation: ${guidance}`;
  }

  async ask(query) {
    await wait(760 + Math.floor(Math.random() * 600));
    return this.buildAnswer(query);
  }
}

export const attachChatUI = ({
  form,
  input,
  messagesBox,
  chatbot,
  getMode
}) => {
  const push = (role, text) => {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${role}`;
    bubble.textContent = text;
    messagesBox.appendChild(bubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    chatbot.setMode(getMode());
    push("user", query);
    input.value = "";

    const typing = document.createElement("div");
    typing.className = "typing";
    typing.textContent = "AI is typing...";
    messagesBox.appendChild(typing);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    const answer = await chatbot.ask(query);
    typing.remove();
    push("bot", answer);
  });

  push("bot", "Ask for constituency sentiment, top issues, or suggested political strategy.");
};
