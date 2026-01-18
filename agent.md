# LearnTube AI – AGENT.md

This document is the **single source of truth** for building the LearnTube AI project.
It is written specifically to be consumed by **AI coding agents (Codex, Copilot, Cursor, etc.)**.

Follow this file strictly. Do NOT invent features outside this scope.

---

## 1. Project Overview

**Project Name:** LearnTube AI  
**Tagline:** AI‑Powered YouTube Learning Assistant

LearnTube AI is a GenAI application that curates **high‑quality educational YouTube videos** based on:
- User goals
- Skill level
- Learning preferences

Unlike YouTube’s entertainment‑driven algorithm, LearnTube AI optimizes for **structured learning, skill progression, and explainable recommendations**.

The project demonstrates:
- LLM usage (GPT‑4)
- NLP & ML pipelines
- RAG architecture
- Vector databases
- API integrations
- Observability & tracing
- Cloud deployment (Azure)

---

## 2. Target Outcome (1‑Week MVP)

By the end of this project, the system must:
- Onboard users and store learning profiles
- Fetch educational videos from YouTube
- Enrich videos using ML/NLP models
- Recommend videos via semantic similarity
- Explain recommendations using LLM + RAG
- Learn from user feedback
- Be deployable and demo‑ready

This is an **AI Engineer MVP**, not a consumer‑grade product.

---

## 3. User Flow (End‑to‑End)

### Step 1: Onboarding

User provides:
- Topics to learn (e.g. AI, Web Dev, Python)
- Skill level per topic (Beginner / Intermediate / Advanced)
- Learning preferences (video length, project‑based vs theory)
- Weekly time commitment
- Goal (career switch, upskilling, hobby)

Store this as a **User Learning Profile**.

---

### Step 2: Content Ingestion

Backend fetches YouTube videos using YouTube Data API:
- Title
- Description
- View count
- Like count
- Published date
- Top comments (sample)

Only educational content is considered.

---

### Step 3: ML & NLP Enrichment

Each video is enriched using ML/NLP:
- Difficulty classification (beginner/intermediate/advanced)
- Comment sentiment analysis (quality signal)
- Topic extraction (optional)

These ML signals must be stored with the video metadata.

---

### Step 4: Embeddings & Vector Search

- Convert video content into embeddings
- Convert user goals into embeddings
- Store embeddings in **Supabase Postgres with pgvector**
- Perform semantic similarity search

Filter recommendations by:
- Difficulty match
- Quality score
- Recency

---

### Step 5: RAG‑Based Explanation

For each recommended video:

Retrieve:
- User profile
- Skill level
- Past watched videos
- Video metadata
- ML‑derived attributes

Generate (GPT‑4):
- Personalized explanation: “Why this video?”

RAG must be explicit and traceable.

---

### Step 6: Feedback Loop

User feedback options:
- Helpful
- Too advanced
- Too basic
- Not relevant

Feedback updates:
- User preference weights
- Difficulty bias
- Future recommendation ranking

Feedback is stored for future model improvement.

---

### Step 7: Progress Tracking

Display:
- Videos watched
- Time spent learning
- Topics covered
- Simple skill progression indicators

---

## 4. AI / ML / NLP Architecture

### Machine Learning Components

Use Hugging Face models for:
- Video difficulty classification
- Comment sentiment analysis

ML is used to **enhance and ground** LLM decisions, not replace them.

---

### Embeddings

Use Sentence Transformers to generate:
- Video embeddings
- User intent embeddings

Similarity metric:
- Cosine similarity

---

### Retrieval Augmented Generation (RAG)

RAG is mandatory.

RAG pipeline:
1. Retrieve user + video context
2. Inject into structured prompt
3. Generate explanation using GPT‑4

No free‑form hallucinated responses allowed.

---

## 5. Technology Stack (FINAL – DO NOT CHANGE)

### Languages
- Python (backend, ML, NLP)
- JavaScript / React (frontend)

---

### AI & NLP
- OpenAI GPT‑4 / GPT‑4o
- Hugging Face Transformers
- Sentence Transformers

---

### Vector Database
- **Supabase Postgres with pgvector** (mandatory)

---

### Backend
- FastAPI
- PostgreSQL (via Supabase)
- Redis (caching + background tasks)
- Celery (background jobs)

---

### Frontend
- React
- Tailwind CSS
- Recharts
- React Player (YouTube)

---

### APIs
- YouTube Data API v3
- OpenAI API
- Hugging Face models

---

### Observability
- LangSmith OR Langfuse
- LLM tracing is mandatory

---

### Cloud & DevOps
- Azure App Service (backend)
- Azure Static Web Apps (frontend)
- Supabase (database + vectors)
- Docker
- GitHub Actions

---

## 6. 7‑Day Execution Plan

- **Day 1:** User onboarding, data models, YouTube ingestion
- **Day 2:** NLP models (difficulty + sentiment)
- **Day 3:** Embeddings + Supabase pgvector search
- **Day 4:** RAG + GPT‑4 explanations
- **Day 5:** Feedback loop + LLM observability
- **Day 6:** Frontend dashboard & UX polish
- **Day 7:** Azure deployment + documentation

---

## 7. Engineering Principles

- Explainability > accuracy
- Simple ML > complex ML
- Clear architecture > feature count
- Business relevance > research depth

---

## 8. Interview Positioning

This project demonstrates:
- End‑to‑end GenAI system design
- LLM + ML + NLP integration
- Vector databases and RAG
- API‑first AI architecture
- Production observability
- Independent execution

Use this project to position as:
**AI Engineer / GenAI Engineer / Full‑stack AI Engineer**

---

## 9. Final Instruction to AI Agents

- Follow this document strictly
- Implement incrementally (day‑wise)
- Do not over‑engineer
- Prioritize working, explainable AI pipelines

---

END OF AGENT.md
