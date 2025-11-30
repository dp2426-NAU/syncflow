# SyncFlow - Real-time Collaborative Task Management Platform

## Overview

SyncFlow is a full-stack web application designed to solve real-time collaboration challenges for distributed software teams. The platform addresses critical pain points including code conflicts, pull request reviews, time zone coordination, and architecture decision alignment through an integrated suite of collaborative tools.

The application provides a Kanban-style task board with live presence indicators, an Architecture Decision Records (ADR) portal, PR review assistance, time zone planning tools, and real-time activity feeds. Built with a modern tech stack, it emphasizes real-time updates, accessibility, and a polished user experience with a dark glass-morphic UI theme.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, configured for optimal performance with code splitting and HMR
- **Wouter** for lightweight client-side routing instead of React Router
- Custom Vite plugins for meta image handling and Replit-specific development features

**UI Component System**
- **shadcn/ui** component library (New York style) with Radix UI primitives for accessible, unstyled components
- **Tailwind CSS v4** (via `@tailwindcss/vite`) with custom design tokens for a dark glass-morphic theme
- CSS variables for theming with primary (cyan neon), secondary (violet), and carefully tuned background colors
- Custom fonts: Inter (sans), Outfit (display), JetBrains Mono (monospace)

**State Management**
- **TanStack Query v5** for server state management with aggressive caching (staleTime: Infinity by default)
- React Hook Form with Zod resolvers for form validation
- Local component state for UI interactions

**Real-time Features**
- Polling-based real-time updates via TanStack Query's refetchInterval (e.g., 5-second intervals for activity feeds)
- Architecture allows for future WebSocket integration (currently using HTTP polling)

**Animation & Interactions**
- Framer Motion for layout animations and transitions (used in TaskCard components)
- Custom CSS animations via Tailwind
- Embla Carousel for carousel components

### Backend Architecture

**Server Framework**
- **Express.js** REST API with TypeScript
- Node.js HTTP server wrapping Express for future WebSocket support
- Custom logging middleware for request/response tracking
- JSON body parsing with raw body preservation for webhook verification

**Development & Production**
- Development mode uses **Vite middleware** for seamless HMR and SSR-style template rendering
- Production mode serves static build artifacts from `dist/public`
- Custom build script using esbuild to bundle server code with selective dependency externalization

**API Design**
- RESTful endpoints organized by resource: `/api/users`, `/api/columns`, `/api/tasks`, `/api/adrs`, `/api/pr-reviews`, `/api/activities`
- Zod schema validation on all POST/PATCH endpoints using `insertUserSchema`, `insertTaskSchema`, etc.
- Consistent error handling with appropriate HTTP status codes
- Type-safe request/response handling via shared schema types

**Data Access Layer**
- **Storage abstraction** (`IStorage` interface) in `server/storage.ts` defining all data operations
- `DatabaseStorage` implementation using Drizzle ORM queries
- Clean separation between HTTP handlers (routes.ts) and data logic (storage.ts)

### Database & ORM

**Database System**
- **PostgreSQL** via Neon serverless driver (`@neondatabase/serverless`)
- Connection pooling configured for serverless environments
- WebSocket polyfill for Node.js compatibility

**ORM & Schema Management**
- **Drizzle ORM** for type-safe database queries with full TypeScript inference
- Schema defined in `shared/schema.ts` for sharing between client and server
- Drizzle Kit for migrations (output to `./migrations` directory)
- `db:push` command for rapid schema prototyping

**Database Schema**
- **users**: Authentication/profile data with timezone, role (Engineer/Reviewer/Architect), online status
- **columns**: Kanban board sections with positioning
- **tasks**: Work items with assignments, viewers, tags, priority, comments counter
- **adrs**: Architecture Decision Records with status, tags, version tracking
- **prReviews**: Pull request analysis with risk levels and checklists (stored as JSONB)
- **activities**: Event log for real-time activity feed
- UUID primary keys using PostgreSQL's `gen_random_uuid()`
- Array columns for multi-select relationships (assignedTo, activeViewers, tags)
- Timestamps with `defaultNow()` for audit trails

**Data Validation**
- Drizzle-Zod integration for automatic Zod schema generation from Drizzle tables
- Insert schemas omit auto-generated fields (id, createdAt)
- Validation errors formatted via `zod-validation-error` for user-friendly messages

### Build & Deployment

**Build Process**
- Custom `script/build.ts` orchestrates both client and server builds
- Client build via Vite outputs to `dist/public`
- Server build via esbuild creates single `dist/index.cjs` bundle
- Selective dependency bundling (allowlist in build.ts) to reduce cold start times by minimizing file system operations

**Environment Configuration**
- `DATABASE_URL` required environment variable for database connection
- Separate NODE_ENV handling for development vs production
- Replit-specific integrations (cartographer, dev banner) conditionally loaded

**Scripts**
- `dev:client`: Vite dev server on port 5000
- `dev`: Development server with tsx watch mode
- `build`: Production build of both client and server
- `start`: Production server from bundled code
- `check`: TypeScript type checking
- `db:push`: Push schema changes to database

### Code Organization

**Monorepo Structure**
- `client/`: React frontend application
  - `src/pages/`: Route components (Dashboard, ADRPage, PRPage, TeamPage)
  - `src/components/`: Reusable UI components and layouts
  - `src/lib/`: Utilities, API client, query configuration
  - `src/hooks/`: Custom React hooks
- `server/`: Express backend
  - `routes.ts`: API endpoint definitions
  - `storage.ts`: Data access layer
  - `db.ts`: Database connection setup
  - `seed.ts`: Database seeding for development
- `shared/`: Code shared between client and server
  - `schema.ts`: Drizzle database schema and Zod validators
- Path aliases configured via TypeScript and Vite:
  - `@/*`: Client source files
  - `@shared/*`: Shared code
  - `@assets/*`: Static assets

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database with WebSocket support for real-time queries
- Required environment variable: `DATABASE_URL`

### UI Component Library
- **Radix UI**: Comprehensive collection of accessible, unstyled React primitives including Dialog, Dropdown, Tooltip, etc.
- **shadcn/ui**: Component patterns and styling built on Radix UI
- Lucide React for icon system

### Development Tools
- **Replit Integrations**: 
  - Vite plugins for runtime error overlay, cartographer, and dev banner
  - Meta image plugin for OpenGraph tag updates with deployment URLs

### Potential Future Integrations
- **WebSocket Service**: Architecture supports WebSocket upgrade via HTTP server (currently using polling)
- **AI/LLM Integration**: PR review helper and ADR suggestions could integrate OpenAI or similar APIs
- **Authentication**: Passport.js dependencies suggest future auth implementation
- **File Storage**: Potential S3/CloudFront integration for attachments
- **Email**: Nodemailer dependency for notifications
- **Payment Processing**: Stripe integration for potential premium features

### Build & Runtime
- esbuild for fast server bundling
- date-fns for date formatting and calculations
- nanoid for ID generation
- zod for runtime validation
- framer-motion for animations