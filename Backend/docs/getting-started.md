# Getting Started

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API key ([get one free](https://aistudio.google.com))
- Mistral API key — optional, used as AI fallback

## Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_key
MISTRAL_API_KEY=your_mistral_key   # optional
```

## Running

```bash
# Development
npm run dev

# Create the first admin account
npm run create-admin
```

Server starts on `http://localhost:3000`. Health check: `GET /health`

## Roles

| Role | What they do |
|---|---|
| `admin` | Creates buggers and team leads, oversees all incidents |
| `bugger` | Reports incidents |
| `teamLead` | Assigns responders, manages resolution |
| `teamMember` | Responds to incidents, posts timeline updates |

No public registration. All accounts are created by admin or team lead.
