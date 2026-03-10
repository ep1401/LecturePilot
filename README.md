
# LecturePilot

LecturePilot is an AI-powered study platform that transforms lecture materials into interactive learning tools. Students can upload lecture slides, notes, or recorded lectures and interact with them through an LLM-powered chat interface that generates answers grounded directly in their course materials.

The system uses retrieval-augmented generation (RAG) with vector embeddings to enable semantic search, question answering, flashcard generation, and quiz generation across uploaded lecture content.

**Live Demo:**  
https://lecture-pilot.vercel.app

---

# Features

## Upload Lecture Materials

Students can upload course materials such as:

- Lecture slides (PDF)
- Lecture notes
- YouTube lecture recordings

LecturePilot processes these materials and converts them into structured knowledge that can be searched and studied.

---

## AI Chat Interface

LecturePilot provides a chat interface that allows students to ask questions about their lecture materials.

Example questions:

- What is the push-relabel algorithm?
- Explain residual graphs from lecture 7
- What concepts should I know for this topic?

The system retrieves relevant sections from uploaded documents and generates responses grounded in the course materials.

---

## Automatic Flashcard Generation

LecturePilot extracts key concepts from lecture materials and automatically generates flashcards to support studying.

Flashcards can be viewed as:

- Global flashcards across the class
- Flashcards from individual documents
- Starred flashcards for review

---

## Automatic Quiz Generation

The platform generates quiz questions directly from lecture materials to help students test their understanding of course concepts.

Questions are grounded in uploaded lecture content rather than generic knowledge.

---

## Semantic Search

LecturePilot supports semantic search across uploaded materials using vector embeddings.

Students can search concepts even if the wording differs from the lecture text.

Example searches:

- residual graph definition
- ford fulkerson proof
- max flow algorithm

---

# System Architecture

LecturePilot is built using a modern full-stack architecture designed for AI-powered document workflows.

**Frontend**
- Next.js
- React
- TypeScript
- TailwindCSS

**Backend**
- FastAPI
- Python

**Database**
- PostgreSQL
- pgvector

**AI Components**
- OpenAI LLMs
- OpenAI embeddings

**Infrastructure**
- Supabase
- Vercel deployment

---

# AI Pipeline

LecturePilot uses a retrieval-augmented generation pipeline to provide accurate answers grounded in lecture materials.

## Document Processing Pipeline

Upload material  
↓  
Text extraction  
↓  
Document chunking  
↓  
Embedding generation  
↓  
Vector storage (pgvector)

## Question Answering Pipeline

User question  
↓  
Vector similarity search  
↓  
Retrieve relevant document chunks  
↓  
Send context + question to LLM  
↓  
Generate grounded response

This ensures responses are based on course materials rather than generic model knowledge.

---

# Example Workflow

1. Create a class  
2. Upload lecture slides or notes  
3. LecturePilot indexes the materials  
4. AI generates flashcards and quiz questions  
5. Students ask questions using the chat interface  

Students can now study directly from their lecture materials.

---

# Running Locally

## Clone the repository

```bash
git clone https://github.com/ep1401/LecturePilot.git
cd LecturePilot
```

## Install backend dependencies

```bash
pip install -r requirements.txt
```

## Run the backend server

```bash
uvicorn app.main:app --reload
```

## Run the frontend

```bash
npm install
npm run dev
```

---

# Future Improvements

Planned improvements include:

- Adaptive study recommendations
- Spaced repetition flashcards
- Lecture timeline navigation
- Collaborative study spaces
- Improved evaluation for RAG responses

---

# Author

**Ethan R. Puckett**  
Princeton University — Computer Science
