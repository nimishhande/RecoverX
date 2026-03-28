# 🚀 ProfitLens: AI-Powered Profit Intelligence

**ProfitLens** is an advanced, full-stack intelligence dashboard built specifically for freelancers, solopreneurs, and agencies. It goes beyond simple time tracking by acting as a proactive business partner—identifying revenue leaks, analyzing client profitability, and providing automated, agentic business advice to maximize margins.

---

## 💻 Tech Stack
* **Frontend UI**: React 19 + Vite for ultra-fast compilation.
* **Styling**: Custom CSS architecture featuring a cohesive "Glassmorphism" Dark Theme with neon green accents.
* **Data Visualization**: Recharts (Dynamic SVG Line and Pie Charts) and Lucide-React (Vector iconography).
* **AI & Voice Engines**: Native Web SpeechSynthesis API for text-to-speech, completely custom rule-based agentic JavaScript logic.
* **Storage Architecture**: Hybrid. Legacy Node.js/Express backend authentication bridged to a robust LocalStorage mock-database (originally scoped for Firebase) to guarantee 100% offline reliability during live presentations without Cloud permission bottlenecks.

---

## 🧠 Core Features & Pitch Guide

Use this section as a reference script when explaining the application to the judges:

### 1. Futuristic Authentication & Voice AI
* **The Pitch**: "We wanted the user to feel the power of the platform the exact second they log in."
* **How it works**: When the user clicks "Sign In", the application bypasses standard loading bars and instead interfaces with the browser's native `SpeechSynthesis` AI. It reads the user's name dynamically and greets them out loud ("Welcome back, Sanchita. Initializing your profit intelligence engine").

### 2. The Command Center Dashboard
* **The Pitch**: "Unlike generic task managers, ProfitLens strictly cares about your bottom line."
* **How it works**: The Dashboard instantly aggregates every data point across all active projects. It calculates the **Global Effective Rate** (real revenue divided by actual hours worked, not just estimates), computes total **Hidden Losses**, and monitors aggregate **Scope Creep**.

### 3. "Profit Advisor" Agent (🔥 Agentic Loop)
* **The Pitch**: "Our platform doesn't just display data; it acts on it."
* **How it works**: Built directly into the Dashboard is a background algorithmic loop. This agent continually monitors the user's active projects. If it detects that *Non-Billable time* (like zoom calls or endless revisions) exceeds a **40% threshold**, it automatically spawns an actionable Intelligence Alert. 
* **The Result**: It literally tells the user: *"⚠️ You spent 50% of your time on revisions. Suggestion: Limit revisions strictly in your contract, or instantly increase project price by 25%."*

### 4. Live Rule-Based Chatbot Assistant
* **The Pitch**: "A consultant living right on your sidebar."
* **How it works**: We've integrated a custom Chat UI with clickable "Quick Prompts". Users can ask questions like "How do I fix scope creep?" and the assistant instantly responds with pre-programmed, high-value business development advice.

### 5. Advanced Time & Loss Tracking
* **The Pitch**: "We track where the money actually bleeds out."
* **How it works**: Users can use a dynamic Live Stopwatch or manually log specific chunks of hours. Most importantly, they must select a *Category* (Billable, Calls, Revisions, Admin). The engine multiplies non-billable hours by the project's specific "Minimum Acceptable Hourly Rate" to mathematically quantify exactly how many absolute dollars were leaked.

### 6. Client Portfolio Analytics (`/portfolio`)
* **The Pitch**: "Identify your worst clients."
* **How it works**: This module scans all time logs and groups them by Client rather than by Project. It calculates an aggregate Effective Rate for that specific client, instantly highlighting "Unprofitable" clients in red if they drag down the user's minimum rate targets.

### 7. AI Insights Engine (`/insights`)
* **The Pitch**: "Deep-dive anomaly detection."
* **How it works**: A dedicated center containing all the rule-based logic outputs, pointing out projects that have busted their initial estimated hour budgets and warning users to renegotiate active retainers before it's too late.

---

## 🎯 The "Wow!" Presentation Flow
If you want to blow the judges away, follow these exact steps:

1. **Start on the Login Page**. Type your name before the `@` symbol (e.g. `sanchita@profitlens.com`). Turn your volume up and click **Sign In**. The AI Voice will greet you aloud.
2. **Show the Dashboard**. Point out the calculated "Effective Rate" and the "Earnings Trend" graph.
3. **Show the Live Chatbot**. Click the `⚡ Scope Creep` lightning-bolt pill on the right side and watch the Chatbot instantly reply with business advice.
4. **Demonstrate the Agent**. Go to the Time Tracking tab. Create a manual time entry for an existing project. Set the hours incredibly high (e.g., `15`), and set the category to `"Revisions"`.
5. **The Reveal**. Click back to the Dashboard. Because you just logged massive non-billable time, the charts will violently shift red, and the **⚡ Agent Advisor** card will instantly spawn on the right side, telling the user to hike their prices by 25%.

Good luck team! You built an incredible, highly-functional software product.