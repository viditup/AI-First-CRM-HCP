# AI-First CRM HCP Module – Log Interaction Screen

An AI-powered CRM module for pharmaceutical field representatives to log and manage interactions with Healthcare Professionals (HCPs). Built with **React + Redux** on the frontend and **FastAPI + LangGraph + Groq** on the backend.

## Architecture

```
┌────────────────────────────┐     ┌───────────────────────────────────────┐
│     React + Redux UI       │────▶│         FastAPI Backend               │
│  (Form Mode / Chat Mode)   │     │                                       │
│                            │     │  ┌─────────────────────────────────┐  │
│  • LogInteractionForm      │     │  │     LangGraph Agent             │  │
│  • ChatInterface           │     │  │     (gemma2-9b-it via Groq)     │  │
│  • HCP Sidebar             │     │  │                                 │  │
│  • InteractionHistory      │     │  │  Tools:                         │  │
│                            │     │  │  1. log_interaction             │  │
│  State: Redux Toolkit      │     │  │  2. edit_interaction            │  │
│  API: Axios                │     │  │  3. search_hcp                  │  │
└────────────────────────────┘     │  │  4. get_interaction_history     │  │
                                   │  │  5. schedule_follow_up          │  │
                                   │  └─────────────────────────────────┘  │
                                   │                                       │
                                   │  Database: PostgreSQL (SQLAlchemy)    │
                                   └───────────────────────────────────────┘
```

## Features

- **Dual Input Mode**: Toggle between a structured form and a conversational AI chat to log interactions
- **LangGraph AI Agent**: Conversational agent powered by Groq (gemma2-9b-it) with 5 specialized tools
- **HCP Directory**: Sidebar with searchable list of healthcare professionals
- **Interaction History**: View past interactions with AI-generated summaries
- **Follow-up Scheduling**: Schedule and track follow-up tasks

## Tech Stack

| Layer     | Technology                                 |
| --------- | ------------------------------------------ |
| Frontend  | React 19, Redux Toolkit, Vite, Lucide Icons |
| Backend   | Python 3.11+, FastAPI, SQLAlchemy          |
| AI Agent  | LangGraph, LangChain, Groq (gemma2-9b-it) |
| Database  | PostgreSQL                                 |
| Font      | Google Inter                               |

## LangGraph Agent Tools

1. **`log_interaction`** – Logs a new HCP interaction. Captures interaction type, date, products discussed, key topics, notes, sentiment, and follow-up status. The LLM extracts structured data from natural language.

2. **`edit_interaction`** – Modifies an existing interaction record. Supports partial updates to any field.

3. **`search_hcp`** – Searches the HCP database by name, specialty, institution, or city. Returns matching records with tier information.

4. **`get_interaction_history`** – Retrieves past interactions for a specific HCP, ordered by date. Provides context for the AI agent to give informed recommendations.

5. **`schedule_follow_up`** – Creates follow-up tasks linked to HCPs and interactions, with priority levels and due dates.

## Setup & Running

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL running locally
- Groq API key ([get one here](https://console.groq.com))

### Backend Setup

```bash
cd crm-hcp-module/backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env and set your GROQ_API_KEY and DATABASE_URL

# Create the database
createdb crm_hcp   # or create via pgAdmin

# Run the server (auto-seeds sample data on first start)
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd crm-hcp-module/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the App

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
crm-hcp-module/
├── backend/
│   ├── main.py              # FastAPI app with REST endpoints
│   ├── agent.py             # LangGraph agent definition
│   ├── agent_tools.py       # 5 LangGraph tools
│   ├── models.py            # SQLAlchemy models (HCP, Interaction, FollowUp)
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # Database configuration
│   ├── seed_data.py         # Sample data seeder
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/client.js    # Axios API client
│   │   ├── store/           # Redux Toolkit store & slices
│   │   │   ├── store.js
│   │   │   ├── hcpSlice.js
│   │   │   ├── interactionSlice.js
│   │   │   ├── chatSlice.js
│   │   │   └── uiSlice.js
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LogInteractionForm.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   └── InteractionHistory.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   └── index.html
└── README.md
```

## How It Works

### Form Mode
Select an HCP from the sidebar, fill in the interaction details using the structured form (interaction type, date, products, topics, notes, sentiment), and click "Log Interaction."

### Chat Mode
Toggle to "AI Chat" and describe your interaction naturally. For example:
> "I had a 30-minute meeting with Dr. Sharma today about CardioShield. She was very positive about the Phase III results and wants samples. We need to follow up with the clinical data pack next week."

The LangGraph agent will:
1. Search for Dr. Sharma in the database
2. Extract interaction details (type, products, sentiment, etc.)
3. Log the interaction
4. Schedule a follow-up task

## API Endpoints

| Method | Endpoint                      | Description              |
| ------ | ----------------------------- | ------------------------ |
| GET    | `/api/hcps`                   | List all HCPs            |
| GET    | `/api/hcps/:id`               | Get HCP details          |
| POST   | `/api/hcps`                   | Create new HCP           |
| GET    | `/api/interactions`           | List interactions        |
| POST   | `/api/interactions`           | Create interaction       |
| PUT    | `/api/interactions/:id`       | Update interaction       |
| DELETE | `/api/interactions/:id`       | Delete interaction       |
| GET    | `/api/follow-ups`             | List follow-ups          |
| POST   | `/api/follow-ups`             | Create follow-up         |
| POST   | `/api/chat`                   | Chat with AI agent       |
