# SyncFlow - Real-time Collaborative Task Management

A full-stack collaborative task management platform designed for distributed software development teams. Built to solve real-time collaboration challenges including task tracking, architecture decisions, code reviews, and time zone coordination.

## Features

### Task Board
- Kanban-style board with Backlog, In Progress, Review, and Done columns
- Live presence indicators showing team member status (online/idle/offline)
- Active viewer tracking to prevent duplicate work
- Real-time activity feed

### Architecture Decision Records (ADR)
- Document and track important technical decisions
- Status workflow: Proposed → Accepted/Rejected
- Tag-based organization
- Version history

### AI-Powered PR Review Helper
- Analyze pull requests with AI assistance
- Automatic risk level assessment (Low/Medium/High)
- Generated review checklists
- Code change summaries

### Team Collaboration
- Time zone visualization for distributed teams
- Member availability status
- Role-based team organization (Engineer, Reviewer, Architect)

### Real-time Notifications
- Instant alerts for task assignments and updates
- Unread count badge
- Mark as read functionality

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI API for code analysis
- **State Management**: TanStack Query
- **Routing**: Wouter

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/syncflow.git
cd syncflow
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file with:
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
```

4. Push database schema
```bash
npm run db:push
```

5. Start development server
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── lib/           # Utilities and API client
│   │   └── hooks/         # Custom React hooks
├── server/                 # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database operations
│   └── db.ts              # Database connection
├── shared/                 # Shared code
│   └── schema.ts          # Database schema and types
└── migrations/            # Database migrations
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/board | Get all columns with tasks |
| GET | /api/users | Get all team members |
| POST | /api/tasks | Create a new task |
| PATCH | /api/tasks/:id | Update a task |
| GET | /api/adrs | Get architecture decisions |
| POST | /api/pr-reviews/analyze | Analyze PR with AI |
| GET | /api/notifications/:userId | Get user notifications |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema to database
- `npm run check` - TypeScript type checking

## License

MIT License
