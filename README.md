# NewsGraph AI 🧠📰

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4)
![AI](https://img.shields.io/badge/AI-RAG%20Powered-8B5CF6)

**Transform information overload into actionable intelligence.**

An AI-powered news intelligence platform featuring **RAG (Retrieval-Augmented Generation)**, **3D Knowledge Visualization**, **Multi-Source Historical Context**, and **Bias Detection**.

[Features](#-features) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [API Reference](#-api-reference) · [Contributing](#-contributing)

</div>

---

## 🎯 What is NewsGraph AI?

NewsGraph AI is a next-generation news intelligence platform that goes beyond traditional news aggregation. It combines:

- **Real-time global news feeds** from multiple sources
- **RAG-powered context retrieval** with multi-signal relevance scoring
- **Interactive 3D Knowledge Graphs** for visualizing article relationships
- **Historical Timeline Analysis** spanning 1, 3, 5, and 10 years
- **AI-generated intelligence briefings** with source attribution
- **Multi-perspective bias detection** across political spectrums

### The Problem

| Challenge | Impact |
|-----------|--------|
| 📊 **Information Overload** | Thousands of articles published daily |
| 🔗 **Lack of Context** | Stories exist in isolation |
| ⏱️ **Time Constraints** | No time to read multiple sources |
| 🎭 **Hidden Bias** | Difficult to identify perspective slants |
| 📅 **No Historical Context** | Missing long-term patterns and precedents |

### The Solution

NewsGraph AI addresses these challenges with:

1. **RAG-Enhanced Search** - Multi-signal scoring (title, content, phrase, recency, credibility)
2. **3D Visualization** - Interactive knowledge graphs with Three.js
3. **Timeline Analysis** - Historical context from 1, 3, 5, and 10 years back
4. **Intelligence Desk** - AI-synthesized briefings with structured insights
5. **Bias Detection** - Multi-perspective analysis across political spectrum

---

## ✨ Features

### 🔍 Enhanced RAG Engine

Our custom RAG implementation uses **multi-signal relevance scoring**:

```
Final Score = (Title×0.40) + (Content×0.25) + (Phrase×0.15) + (Recency×0.10) + (Credibility×0.10)
```

**Key Features:**
- TF-IDF based semantic matching
- Entity extraction (people, organizations, locations)
- Source credibility weighting (Reuters, AP, BBC ranked highest)
- LLM-powered relevance validation via Groq

### 🌐 3D RAG Visualization

Interactive Three.js-powered knowledge graph:

- **Spherical node layout** with source-based coloring
- **Connection lines** showing article relationships
- **Click-to-analyze** any node for detailed scoring breakdown
- **Zoom, pan, and rotate** controls
- **Real-time article fetching** from multiple news APIs

### 📅 Knowledge Timeline Graph

Historical context spanning multiple timeframes:

| Timeframe | Color | Purpose |
|-----------|-------|---------|
| Current | 🟢 Green | Breaking news & recent events |
| 1 Year | 🔵 Blue | Short-term historical context |
| 3 Years | 🟣 Purple | Medium-term patterns |
| 5 Years | 🟠 Orange | Long-term trends |
| 10 Years | 🔴 Red | Decade-spanning historical precedents |

**Features:**
- Toggle individual timeframes on/off
- Search within timeline
- SVG-based timeline visualization
- Animated node transitions

### 🧠 Intelligence Desk

AI-powered briefing generator (formerly "Personal Editor"):

**Capabilities:**
- **Quick Topic Pills** - One-click access to AI, Markets, Climate, Geopolitics, Crypto, Healthcare
- **Multi-step Processing** - Visual feedback during analysis
- **Structured Output** - Executive Summary, Key Developments, Strategic Context, Future Implications
- **Export Options** - Copy, Download as Markdown, Share, Bookmark

**Output Format:**
```markdown
## 🎯 Executive Summary
High-level synthesis in 2-3 sentences

## 🔑 Key Developments  
• [Date/Source]: Specific fact or data point
• [Date/Source]: Another critical development

## 🧠 Strategic Context
Analysis of drivers and underlying forces

## 🔮 Future Implications
• Short Term: Next 30 days outlook
• Long Term: Structural shifts and risks
```

### 🎭 Multi-Perspective Bias Analysis

Analyze any topic across political perspectives:

- **Progressive** (Left-leaning sources)
- **Mainstream** (Centrist sources)  
- **Conservative** (Right-leaning sources)

Includes sentiment scoring and framing analysis.

### 🎨 The Verge-Inspired UI

Premium visual design featuring:

- **Dark/Light Mode** with instant toggle
- **Spotlight Effects** - Cursor-following gradients
- **Bold Typography** - Uppercase tracking, strong hierarchy
- **Color Palette** - Verge Green (#00dc82) accents
- **Framer Motion** animations throughout

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.17+ ([Download](https://nodejs.org/))
- **npm** 9.0+ (comes with Node.js)

### API Keys Required

| Service | Purpose | Get Key |
|---------|---------|---------|
| NewsAPI | Primary news source | [newsapi.org/register](https://newsapi.org/register) |
| Groq | LLM inference | [console.groq.com](https://console.groq.com/) |
| GNews (optional) | Secondary news source | [gnews.io](https://gnews.io/) |

### Installation

```bash
# Clone the repository
git clone https://github.com/samvitgersappa/newsgraph-ai.git
cd newsgraph-ai

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local
# NEXT_PUBLIC_NEWS_API_KEY=your_key_here
# GROQ_API_KEY=your_key_here
# GNEWS_API_KEY=your_key_here (optional)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        NewsGraph AI                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   News Feed  │  │  3D RAG View │  │  Intelligence │          │
│  │    (Grid)    │  │   (Three.js) │  │     Desk      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│  ┌──────▼─────────────────▼──────────────────▼───────┐          │
│  │              Server Actions (app/actions.ts)       │          │
│  │  • getRelatedContext()  • fetchRAGArticlesForQuery │          │
│  │  • generateBriefingAction()  • chatWithArticle()   │          │
│  └──────┬─────────────────┬──────────────────┬───────┘          │
│         │                 │                  │                   │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐          │
│  │ Enhanced News│  │  RAG Engine  │  │   Groq LLM   │          │
│  │   Service    │  │ (TF-IDF +    │  │ (Llama 3.1)  │          │
│  │ (Multi-API)  │  │  Vectors)    │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Initial Load** → Fetch from NewsAPI + index in RAG engine
2. **User Search** → Multi-signal scoring + LLM validation
3. **3D View** → Real-time article fetching with breakdown
4. **Timeline** → Historical context from 1-10 years
5. **Briefing** → Live news + RAG context → LLM synthesis

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Server Actions | Security - API keys never exposed to client |
| In-Memory Vector Store | Fast iteration (upgradeable to Pinecone/Supabase) |
| Groq LLM | Sub-second inference with Llama 3.1 |
| Multi-Source News | Redundancy and broader coverage |
| Historical Context | Patterns emerge over time |

---

## 🛠️ Tech Stack

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 15 | App Router, Server Actions |
| React | 19 | UI Components |
| Tailwind CSS | v4 | Styling |
| @react-three/fiber | 9.x | 3D Rendering |
| @react-three/drei | 10.x | Three.js Helpers |
| Framer Motion | 11.x | Animations |
| react-zoom-pan-pinch | 3.x | Timeline Navigation |

### Backend & AI
| Package | Purpose |
|---------|---------|
| @langchain/core | AI Orchestration |
| @langchain/groq | Groq LLM Provider |
| date-fns | Date Manipulation |

### APIs
| Service | Purpose |
|---------|---------|
| NewsAPI.org | Primary news source |
| GNews.io | Secondary news source |
| Wikipedia API | Background context |

---

## 📂 Project Structure

```
newsgraph-ai/
├── app/
│   ├── actions.ts                 # Server Actions (RAG, LLM, API)
│   ├── multi-perspective-actions.ts # Bias analysis actions
│   ├── client-page.tsx            # Main client component
│   ├── globals.css                # Tailwind + theme config
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Server entry (data fetching)
│
├── components/
│   ├── BiasHeatMap.tsx            # Political bias visualization
│   ├── DeepDiveSidebar.tsx        # Context sidebar
│   ├── GraphView.tsx              # Timeline Knowledge Graph
│   ├── MultiPerspectiveView.tsx   # Multi-source bias view
│   ├── NewsCard.tsx               # Article card
│   ├── NewsFeed.tsx               # Grid layout
│   ├── PersonalBriefing.tsx       # Intelligence Desk UI
│   ├── RAG3DView.tsx              # 3D RAG Visualization
│   ├── RAGInsightsPanel.tsx       # RAG scoring panel
│   ├── SentimentHeatMap.tsx       # Sentiment analysis
│   ├── Spotlight.tsx              # Cursor effect
│   ├── ThemeProvider.tsx          # Theme context
│   └── ThemeToggle.tsx            # Dark/light toggle
│
├── lib/
│   ├── bias-detector.ts           # Bias detection logic
│   ├── credibility-ratings.ts     # Source credibility scores
│   ├── enhanced-news-service.ts   # Multi-source + historical
│   ├── news-service.ts            # NewsAPI integration
│   ├── rag-engine.ts              # RAG + vector store
│   └── sentiment-analyzer.ts      # Sentiment analysis
│
├── public/                        # Static assets
├── .env.example                   # Environment template
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── README.md                      # This file
```

---

## 🔌 API Reference

### Server Actions

#### `getRAGScoredResults(query, k)`
Returns RAG-scored articles with detailed breakdown.

```typescript
const results = await getRAGScoredResults("artificial intelligence", 10);
// Returns: Array<{ content, metadata, score, breakdown }>
```

#### `fetchRAGArticlesForQuery(query)`
Fetches articles for 3D visualization with LLM validation.

```typescript
const articles = await fetchRAGArticlesForQuery("climate change");
// Returns: Array<{ id, title, source, score, breakdown }>
```

#### `getRelatedContext(query)`
Retrieves related context including historical events.

```typescript
const context = await getRelatedContext("Ukraine conflict");
// Returns: Array<{ content, metadata, isHistorical? }>
```

#### `generateBriefingAction(topic)`
Generates AI briefing on any topic.

```typescript
const briefing = await generateBriefingAction("Federal Reserve policy");
// Returns: string (Markdown formatted)
```

### Scoring Breakdown

```typescript
interface ScoreBreakdown {
  titleMatch: number;       // 0-1, weight: 40%
  contentMatch: number;     // 0-1, weight: 25%
  phraseMatch: number;      // 0-1, weight: 15%
  recency: number;          // 0-1, weight: 10%
  sourceCredibility: number; // 0-1, weight: 10%
}
```

---

## ⚙️ Configuration

### Environment Variables

```env
# Required
NEXT_PUBLIC_NEWS_API_KEY=your_newsapi_key
GROQ_API_KEY=your_groq_key

# Optional (enhanced coverage)
GNEWS_API_KEY=your_gnews_key
```

### LLM Model Selection

Edit `app/actions.ts`:

```typescript
const chat = new ChatGroq({
    model: "llama-3.1-8b-instant", // Fast, recommended
    // model: "llama-3.1-70b-versatile", // More capable
    // model: "mixtral-8x7b-32768", // Long context
});
```

### Source Credibility Weights

Edit `app/actions.ts`:

```typescript
const SOURCE_CREDIBILITY = {
    'Reuters': 1.0,
    'Associated Press': 1.0,
    'BBC News': 0.95,
    'The New York Times': 0.9,
    // ... add more sources
};
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t newsgraph-ai .
docker run -p 3000:3000 --env-file .env.local newsgraph-ai
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No articles loading | Check `NEXT_PUBLIC_NEWS_API_KEY` is valid |
| AI not responding | Verify `GROQ_API_KEY` at [console.groq.com](https://console.groq.com) |
| 3D view not rendering | Ensure WebGL is enabled in browser |
| Rate limit errors | NewsAPI free tier: 100 req/day |
| Build errors | Run `rm -rf node_modules && npm install` |

---

## 🗺️ Roadmap

### ✅ Completed
- [x] RAG-based context retrieval with multi-signal scoring
- [x] 3D Knowledge Graph visualization
- [x] Historical timeline (1, 3, 5, 10 years)
- [x] Intelligence Desk with export options
- [x] Multi-perspective bias analysis
- [x] Dark/Light theme with Verge-style UI

### 🚧 In Progress
- [ ] Persistent vector store (Supabase pgvector)
- [ ] User authentication
- [ ] Saved briefings & bookmarks

### 🔮 Future
- [ ] PDF export for briefings
- [ ] Email digest subscriptions
- [ ] Voice interface (TTS briefings)
- [ ] Mobile app (React Native)
- [ ] Custom news source integration

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork & clone
git clone https://github.com/YOUR_USERNAME/newsgraph-ai.git

# Create branch
git checkout -b feature/amazing-feature

# Make changes & commit
git commit -m "Add amazing feature"

# Push & open PR
git push origin feature/amazing-feature
```

### Guidelines
- Follow existing code style
- Add TypeScript types
- Test on both themes
- Update README for new features

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [NewsAPI](https://newsapi.org/) - News data provider
- [Groq](https://groq.com/) - Lightning-fast LLM inference
- [Vercel](https://vercel.com/) - Hosting platform
- [Three.js](https://threejs.org/) - 3D graphics library
- [The Verge](https://www.theverge.com/) - UI inspiration

---

<div align="center">

**Built with ❤️ by [Samvit Gersappa](https://github.com/samvitgersappa)**

⭐ Star this repo if you find it useful!

[⬆ Back to Top](#newsgraph-ai-)

</div>
