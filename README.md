# SentimentX - Real-Time Political Sentiment Intelligence

> *Turn social sentiment into battlefield strategy in seconds, not weeks.*

A real-time political sentiment analysis dashboard that gives campaigns booth-level intelligence with confidence scoring and war-room ready reports.

## 🎯 Features

### Core Intelligence
- **Multi-Language Sentiment Analysis** - English, Hindi, Hinglish support
- **Booth-Level Heatmaps** - Geographic sentiment hotspots at a glance
- **Micro-Insights** - Click any booth for detailed breakdown & top complaints
- **Constituency Analysis** - Regional sentiment aggregation

### Risk & Confidence
- **Risk Ranking Panel** - Top 5 at-risk constituencies with severity levels
- **Confidence Scoring** - Know which signals are trustworthy (high/medium/low)
- **Data Quality Metrics** - Excellent/Good/Fair assessment
- **Live Alerts** - Negative sentiment spikes trigger instant notifications

### War-Room Ready
- **Interactive War-Room Report** - Print/export decision-ready summaries
- **CSV Export** - Full dataset for further analysis
- **Replay Timeline** - Historical playback of sentiment shifts
- **AI Assistant** - Query-based campaign strategy generator

### UX Polish
- **Dark/Light Theme** - Optimized for 24-hour war rooms
- **Smooth Transitions** - 340ms+ easing for professional feel
- **Mobile Responsive** - Scales from phone to desktop
- **Live Feed** - Streaming sentiment signals with confidence badges

## 🔧 Tech Stack

- **Frontend**: HTML5, CSS3 (custom design system)
- **Visualization**: Chart.js (pie, line, bar charts)
- **Icons**: Lucide Icons
- **NLP**: Lexicon-based sentiment engine (custom implementation)
- **State Management**: Vanilla JavaScript (no framework)
- **Styling**: CSS variables for dynamic theming

## 📊 Data Pipeline

1. **Ingestion** - Simulated booth/constituency data (API-ready)
2. **Sentiment Analysis** - Multi-language lexicon matching + confidence scoring
3. **Aggregation** - Real-time breakdown by sentiment, region, language
4. **Visualization** - Live charts, heatmaps, risk rankings
5. **Export** - War-room reports, CSV dumps, TXT summaries

## 🚀 Quick Start

### Run Locally
```bash
git clone https://github.com/YOUR_USERNAME/SentimentX.git
cd SentimentX
# Open index.html in your browser (no build needed!)
```

### Demo Mode
- Toggle **Demo Mode** in sidebar: Low Activity ↔ High Activity
- Switch **Theme**: Light ↔ Dark
- Click tabs to explore: Overview → Booth → Constituency → Trends → AI Assistant

### Export Data
- **CSV Export**: Full dataset download in comma-separated format
- **War-Room Report**: Decision-ready summary with print/export options
- **All data includes**: Confidence scores, regional breakdown, top issues, strategies

## 📈 Dashboard Sections

| Tab | Function |
|-----|----------|
| **Overview** | Sentiment pie chart, live feed, risk ranking, confidence metrics |
| **Booth Analysis** | Spatial heatmap, micro-insights on click |
| **Constituency** | Regional aggregation, replay timeline |
| **Trends & Issues** | Keyword extraction, frequency bars |
| **AI Assistant** | Chat-based strategy recommendations (ChatGPT/Gemini modes) |

## 🎮 Key Metrics

- **KPI Strip**: Total signals, Positive %, Negative %, Neutral %
- **Risk Severity**: High (red) / Medium (yellow) / Low (green)
- **Confidence Levels**: High (≥80%) / Medium (60-80%) / Low (<60%)
- **Data Quality**: Excellent/Good/Fair based on average confidence

## 🔐 Privacy & Compliance

- All sentiment analysis is **anonymized**—no personal data stored
- Only aggregated metrics per booth/constituency retained
- Multi-source verification (Social/News/Survey) prevents single-point bias
- Confidence scoring flags low-quality/bot-like signals

## 🎯 Hackathon Story

Built for **Hack4Fire** to solve campaign decision bottlenecks:
- **Problem**: Weekly polls vs. real-time voter sentiment needs
- **Solution**: Real-time booth-level intelligence with confidence scoring
- **Impact**: From days to minutes for risk detection & campaign pivots

## 🚢 Deployment Ready

- **No dependencies** - Pure HTML/CSS/JavaScript
- **Offline capable** - Works without internet (uses local data)
- **Browser compatible** - Chrome, Firefox, Safari, Edge (ES6+)
- **Mobile optimized** - Responsive design from 320px → 1920px+

## 📈 Next Steps

- [ ] Integrate real social media APIs (Twitter, Reddit, Facebook)
- [ ] Predictive modeling (48-hour sentiment forecasting)
- [ ] Mobile app for field teams
- [ ] Multi-party competitive analysis
- [ ] Custom NLP model training

## 👥 Credits

- **Sentiment Engine**: Lexicon-based NLP with language-specific bias adjustment
- **Visualization**: Chart.js + custom CSS animations
- **Architecture**: Real-time reactive dashboard pattern

---

**Made for political intelligence. Proven in 3-language environments. Ready for war rooms.** 🚀

*"SentimentX gives campaigns the speed and precision of intelligence agencies. In politics, every hour matters."*
