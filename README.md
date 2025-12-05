# Personal Assistant - Life-Sync 2.0

AI-powered personal assistant frontend for Life-Sync 2.0. This is the chat interface that connects to the personal-assistant-api orchestrator.

## Part of Life-Sync 2.0 Ecosystem

| Service                | Type     | Port | Path                   |
| ---------------------- | -------- | ---- | ---------------------- |
| wealth-pulse-fe        | Frontend | 3000 | /life-sync/wealthpulse |
| life-notes-fe          | Frontend | 3000 | /life-sync/lifenotes   |
| **personal-assistant** | Frontend | 3000 | /life-sync/assistant   |
| wealth-pulse-api       | Backend  | 3001 | /api                   |
| life-notes-api         | Backend  | 3002 | /api                   |
| personal-assistant-api | Backend  | 3003 | /api                   |

## Features

- 💬 **AI Chat Interface** - Natural language conversation with your personal assistant
- 📝 **Conversation History** - Sidebar with all your conversations
- 🔄 **Streaming Responses** - Real-time AI response streaming (planned)
- 📱 **Responsive Design** - Works on mobile and desktop
- 🎨 **Dark Theme** - Easy on the eyes

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: React hooks (useState, useEffect)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000/life-sync/assistant](http://localhost:3000/life-sync/assistant) to view the app.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with metadata
│   └── page.tsx        # Main chat page
├── components/
│   ├── ChatMessage.tsx # Message bubble component
│   ├── ChatInput.tsx   # Chat input with send button
│   └── Sidebar.tsx     # Conversation history sidebar
└── types/
    └── index.ts        # TypeScript interfaces
```

## Environment Variables

```env
# API Configuration (for personal-assistant-api)
NEXT_PUBLIC_API_URL=http://localhost:3003/api
```

## Deployment

This app is deployed on Vercel with the base path `/life-sync/assistant`.

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Roadmap

- [ ] Connect to personal-assistant-api
- [ ] Implement streaming responses
- [ ] Add expense tracking via chat
- [ ] Add notes/todos management via chat
- [ ] Voice input support
- [ ] Push notifications

## Related Repositories

- [life-sync-2.0](https://github.com/baalajimaestro/life-sync-2.0) - Infrastructure & Gateway
- [wealth-pulse-api](https://github.com/baalajimaestro/wealth-pulse-api) - Expense tracking API
- [life-notes-api](https://github.com/baalajimaestro/life-notes-api) - Notes & Todos API
- [personal-assistant-api](https://github.com/baalajimaestro/personal-assistant-api) - AI Orchestrator API

## License

MIT
