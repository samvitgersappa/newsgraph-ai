# NewsGraph AI 🧠📰

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-cyan)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![AI](https://img.shields.io/badge/AI-Powered-purple)

**Transform information overload into actionable intelligence.**

[Live Demo](#) · [Report Bug](https://github.com/samvitgersappa/newsgraph-ai/issues) · [Request Feature](https://github.com/samvitgersappa/newsgraph-ai/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Demo](#-demo)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**NewsGraph AI** is a next-generation news intelligence platform that goes beyond traditional news aggregation. By combining real-time global news feeds with **Retrieval-Augmented Generation (RAG)** and an interactive **Knowledge Graph**, it transforms how you consume and understand information.

### The Problem

In today's information age:
- **Information Overload**: Thousands of articles published daily
- **Lack of Context**: Stories exist in isolation without connections
- **Time Constraints**: No time to read multiple sources for full understanding
- **Bias & Noise**: Difficulty separating signal from noise

### The Solution

NewsGraph AI addresses these challenges by:
1. **Synthesizing** multiple sources into executive briefings
2. **Visualizing** connections between stories and entities
3. **Enabling** natural language interrogation of news content
4. **Providing** strategic context and future implications

---

## ✨ Key Features

### 🔍 Deep Dive Context Engine

Click any news article to unlock a powerful sidebar containing:

- **Interactive Knowledge Graph**: Force-directed visualization showing:
  - Related articles and their connections
  - Shared entities (people, organizations, locations)
  - Temporal relationships
  - Zoom, pan, and click nodes for details

- **Contextual AI Chat**: Ask questions about the specific article:
  ```
  "What is the background of this conflict?"
  "Who are the key political figures involved?"
  "Summarize the financial impact in bullet points"
  "What happened before this event?"
  ```

### 🤖 Personal Editor (Agentic Intelligence)

A "Commercial-Grade" AI analyst that generates executive briefings on **any topic**:

**Features:**
- **Live Research**: Actively queries NewsAPI for the latest articles
- **Multi-Source Synthesis**: Combines 5-10 sources for comprehensive analysis
- **Structured Output**: Professional Markdown reports with:
  - 🎯 **Executive Summary**: 2-3 sentence strategic overview
  - 🔑 **Key Developments**: Bulleted facts with dates and sources
  - 🧠 **Strategic Context**: Analysis of drivers and forces
  - 🔮 **Future Implications**: Short and long-term forecasts

**Visual Process Indicator:**
Watch the AI work in real-time:
1. ✓ Scanning Global News Network...
2. ✓ Extracting Key Entities...
3. ✓ Cross-Referencing Sources...
4. ✓ Synthesizing Intelligence Report...

### 🎨 Premium UI/UX

**Adaptive Theming:**
- **Dark Mode**: Data-rich interface with Zinc/Black palette
- **Light Mode**: Clean, high-contrast White/Gray design
- **Instant Toggle**: Seamless switching with animated transitions

**Visual Effects:**
- **Spotlight Cards**: Cursor-following radial gradients
- **Glassmorphism**: Translucent UI elements with backdrop blur
- **Micro-interactions**: Smooth Framer Motion animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile

---

## 🎬 Demo

### Main Feed
![Main Feed](https://via.placeholder.com/1200x600/000000/ffffff?text=NewsGraph+AI+Feed)

### Deep Dive Sidebar
![Deep Dive](https://via.placeholder.com/1200x600/000000/ffffff?text=Deep+Dive+Context)

### Personal Editor
![Personal Editor](https://via.placeholder.com/1200x600/000000/ffffff?text=AI+Briefing+Generator)

---

## 🏗️ Architecture

### System Overview

```mermaid
<<<<<<< HEAD
graph TD
  User[User] --> UI["Next.js Client UI"]
  UI --> Server["Server Actions"]
  Server --> NewsAPI["NewsAPI.org"]
  Server --> VectorDB["In-Memory Vector Store"]
  Server --> LLM["Groq (Llama 3.1)"]

  NewsAPI -->|Raw Articles| Server
  Server -->|Embeddings| VectorDB
  VectorDB -->|Context| LLM
  LLM -->|Briefing / Chat| UI
=======
graph TB
    User[👤 User] --> UI[Next.js Client UI]
    UI --> ServerActions[Server Actions]
    
    ServerActions --> NewsAPI[NewsAPI.org]
    ServerActions --> VectorDB[Vector Store]
    ServerActions --> LLM[Groq LLM]
    
    NewsAPI -->|Raw Articles| ServerActions
    ServerActions -->|Embeddings| VectorDB
    VectorDB -->|Context Retrieval| LLM
    LLM -->|Generated Briefing| UI
    
    style User fill:#4F46E5
    style LLM fill:#7C3AED
    style NewsAPI fill:#2563EB
```

### Data Flow

1. **Initial Load**: Server fetches top headlines from NewsAPI
2. **Indexing**: Articles are embedded and stored in vector database
3. **User Interaction**: 
   - Click article → Retrieve related context via similarity search
   - Generate briefing → Fetch live news + RAG context → LLM synthesis
   - Ask question → Combine article + context → LLM response

### Key Design Decisions

- **Server Actions**: All AI/API calls happen server-side for security
- **In-Memory Vector Store**: Fast, simple demo implementation (upgradeable to Pinecone/Supabase)
- **Groq for LLM**: Sub-second inference latency with Llama 3.1
- **Next.js App Router**: Modern React patterns with streaming support

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (new engine)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown)

### Backend & AI
- **Runtime**: Node.js 18+
- **AI Orchestration**: [LangChain.js](https://js.langchain.com/)
- **LLM Provider**: [Groq](https://groq.com/) (Llama 3.1 8B Instant)
- **Vector Search**: Custom in-memory implementation
- **News API**: [NewsAPI.org](https://newsapi.org/)

### Development
- **Language**: TypeScript 5.0
- **Package Manager**: npm
- **Linting**: ESLint (Next.js config)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18.17 or later ([Download](https://nodejs.org/))
- **npm** 9.0 or later (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

You'll also need API keys from:
- **NewsAPI**: Free tier available at [newsapi.org](https://newsapi.org/register)
- **Groq**: Free tier available at [console.groq.com](https://console.groq.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/samvitgersappa/newsgraph-ai.git
   cd newsgraph-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npm run build
   ```

### Environment Setup

1. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your API keys**
   
   Open `.env.local` and add:
   ```env
   # NewsAPI Key (get from https://newsapi.org/register)
   NEXT_PUBLIC_NEWS_API_KEY=your_actual_newsapi_key_here
   
   # Groq API Key (get from https://console.groq.com/)
   GROQ_API_KEY=your_actual_groq_key_here
   ```

   ⚠️ **Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage Guide

### 1. Browsing the News Feed

- **Scroll** through the grid of top headlines
- **Hover** over cards to see the spotlight effect
- **Click** any card to open the Deep Dive sidebar

### 2. Using Deep Dive Context

**Knowledge Graph:**
- **Zoom**: Mouse wheel or pinch gesture
- **Pan**: Click and drag the background
- **Inspect**: Click any node to see article details

**Ask AI Chat:**
- Type your question in the input box
- Press Enter or click Send
- The AI has full context of the article and related stories

**Example Questions:**
```
"Summarize this in 3 bullet points"
"What are the economic implications?"
"Who are the stakeholders mentioned?"
"What happened before this event?"
```

### 3. Generating Personal Briefings

1. **Enter a topic** in the "Personal Editor" input box
   - Examples: "AI regulation in Europe", "Climate change policy", "Cryptocurrency trends"

2. **Click Generate** or press Enter

3. **Watch the process**:
   - The AI scans live news sources
   - Extracts entities and facts
   - Synthesizes a structured report

4. **Read the briefing**:
   - Each section appears in its own card
   - Executive Summary → Key Developments → Strategic Context → Future Implications

### 4. Switching Themes

- Click the **sun/moon icon** in the top-right corner
- Theme preference is saved to localStorage

---

## 📂 Project Structure

```
newsgraph-ai/
├── app/                          # Next.js App Router
│   ├── actions.ts               # Server Actions (LLM, API calls)
│   ├── client-page.tsx          # Main client component
│   ├── globals.css              # Tailwind config & themes
│   ├── layout.tsx               # Root layout with ThemeProvider
│   └── page.tsx                 # Server entry point (data fetching)
│
├── components/                   # React Components
│   ├── DeepDiveSidebar.tsx      # Sidebar with Graph & Chat
│   ├── GraphView.tsx            # Interactive Knowledge Graph
│   ├── NewsCard.tsx             # Article card with Spotlight
│   ├── NewsFeed.tsx             # Grid layout for cards
│   ├── PersonalBriefing.tsx     # AI briefing generator UI
│   ├── Spotlight.tsx            # Reusable cursor effect
│   ├── ThemeProvider.tsx        # next-themes wrapper
│   └── ThemeToggle.tsx          # Light/Dark mode button
│
├── lib/                          # Core Logic
│   ├── news-service.ts          # NewsAPI integration
│   └── rag-engine.ts            # Vector store & RAG logic
│
├── public/                       # Static assets
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
├── README.md                     # This file
└── tsconfig.json                 # TypeScript config
```

---

## 🔌 API Reference

### Server Actions

All server actions are defined in `app/actions.ts`.

#### `getRelatedContext(query: string)`

Retrieves related articles using vector similarity search.

**Parameters:**
- `query` (string): Search query (article title or topic)

**Returns:**
```typescript
Array<{
  content: string;
  metadata: {
    title: string;
    source: string;
    url: string;
  }
}>
```

#### `generateBriefingAction(topic: string)`

Generates an AI briefing on a given topic.

**Parameters:**
- `topic` (string): Topic to research (e.g., "Indian GDP")

**Returns:**
```typescript
string // Markdown-formatted briefing
```

**Process:**
1. Fetches live news from NewsAPI
2. Retrieves local context from vector store
3. Combines and deduplicates sources
4. Sends to Groq LLM with structured prompt
5. Returns formatted Markdown

#### `chatWithArticle(question: string, context: string)`

Answers questions about a specific article.

**Parameters:**
- `question` (string): User's question
- `context` (string): Article content + related context

**Returns:**
```typescript
string // AI-generated answer
```

---

## ⚙️ Configuration

### Changing the LLM Model

Edit `app/actions.ts`:

```typescript
const chat = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.1-8b-instant", // Change this
    temperature: 0.5,
});
```

**Available Groq Models:**
- `llama-3.1-8b-instant` (fastest, recommended)
- `llama-3.1-70b-versatile` (more capable, slower)
- `mixtral-8x7b-32768` (long context)

### Customizing the Theme

Edit `app/globals.css`:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}
```

### Adjusting News Sources

Edit `lib/news-service.ts` to change:
- News categories
- Countries
- Number of articles fetched

---

## 🌐 Deployment

### Vercel (Recommended)

1. **Push to GitHub** (already done!)

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com/)
   - Click "New Project"
   - Import `samvitgersappa/newsgraph-ai`

3. **Add Environment Variables**
   - `NEXT_PUBLIC_NEWS_API_KEY`
   - `GROQ_API_KEY`

4. **Deploy**
   - Vercel will auto-deploy on every push to `main`

### Other Platforms

**Netlify:**
```bash
npm run build
# Deploy the .next folder
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 🐛 Troubleshooting

### Build Errors

**Error: `GROQ_API_KEY is not set`**
- Ensure `.env.local` exists and contains your key
- Restart the dev server after adding env vars

**Error: `Module not found`**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Runtime Issues

**No articles loading:**
- Check your `NEXT_PUBLIC_NEWS_API_KEY` is valid
- NewsAPI free tier has rate limits (100 requests/day)

**AI not responding:**
- Verify `GROQ_API_KEY` is correct
- Check Groq API status at [status.groq.com](https://status.groq.com/)

**Theme toggle not working:**
- Clear browser cache
- Check browser console for errors

---

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] News aggregation
- [x] RAG-based context retrieval
- [x] AI briefing generation
- [x] Knowledge Graph visualization
- [x] Light/Dark mode

### Phase 2: Enhancements 🚧
- [ ] Persistent vector store (Supabase/Pinecone)
- [ ] User authentication (Clerk/Auth.js)
- [ ] Save favorite articles
- [ ] Export briefings to PDF
- [ ] Email digest subscriptions

### Phase 3: Advanced Features 🔮
- [ ] Multi-language support
- [ ] Voice interface (text-to-speech briefings)
- [ ] Custom news sources
- [ ] Collaborative annotations
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Add TypeScript types for new functions
- Test on both light and dark modes
- Update README if adding features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [NewsAPI](https://newsapi.org/) for news data
- [Groq](https://groq.com/) for lightning-fast LLM inference
- [Vercel](https://vercel.com/) for Next.js and hosting
- [Tailwind Labs](https://tailwindcss.com/) for Tailwind CSS

---

<div align="center">

**Built with ❤️ by [Samvit Gersappa](https://github.com/samvitgersappa)**

[⬆ Back to Top](#newsgraph-ai-)

</div>
