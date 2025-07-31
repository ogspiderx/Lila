# Real-Time Chat Application

## Overview

This is a full-stack real-time chat application built with a modern web stack. The application features a React frontend with TypeScript, an Express.js backend, PostgreSQL database with Drizzle ORM, and WebSocket integration for real-time messaging. The UI is built using shadcn/ui components with Tailwind CSS for styling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared code:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSockets for instant messaging
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management

## Key Components

### Database Schema
- **Users Table**: Stores user credentials with UUID primary keys
- **Messages Table**: Stores chat messages with sender, content, and timestamps
- Uses Drizzle ORM with PostgreSQL dialect for type-safe database operations

### Authentication
- Simple username/password authentication
- Session-based authentication using localStorage for client-side storage
- Hardcoded test users for development (Wale and Xiu)

### Real-time Messaging
- WebSocket server implementation for instant message delivery
- Client-side WebSocket hook for connection management
- Message synchronization between REST API and WebSocket streams

### UI Components
- shadcn/ui component library for consistent design
- Custom message bubble component with animations
- Responsive design with mobile-first approach
- Dark theme with green accent colors

### Storage Layer
- In-memory storage implementation (MemStorage) for development
- Interface-based design allowing easy database integration
- Pre-populated with test users and message history

## Data Flow

1. **Authentication Flow**:
   - User submits credentials via login form
   - Server validates against stored users
   - Client stores user session in localStorage
   - Redirects to chat interface

2. **Message Flow**:
   - Client fetches existing messages via REST API
   - Real-time messages received through WebSocket connection
   - Messages are deduplicated and sorted by timestamp
   - New messages sent via WebSocket to all connected clients

3. **Client-Server Communication**:
   - REST API for authentication and message history
   - WebSocket connection for real-time messaging
   - TanStack Query for caching and synchronization

## External Dependencies

### Core Framework Dependencies
- **React & React DOM**: Frontend framework
- **Express.js**: Backend web framework
- **TypeScript**: Type safety across the stack
- **Vite**: Frontend build tool and development server

### Database & ORM
- **Drizzle ORM**: Type-safe database operations
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-zod**: Schema validation integration

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible components via Radix UI
- **Framer Motion**: Animation library for smooth interactions
- **Lucide React**: Icon library

### State Management & Communication
- **TanStack Query**: Server state management and caching
- **WebSocket (ws)**: Real-time communication
- **Wouter**: Lightweight client-side routing

### Form Handling & Validation
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation
- **@hookform/resolvers**: Form validation integration

## Deployment Strategy

### Development Setup
- Vite dev server for frontend development
- tsx for running TypeScript server files
- Hot module replacement and runtime error overlays
- Replit integration with cartographer plugin

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- esbuild bundles server code to `dist/index.js`
- Static file serving for production deployment
- Environment-based configuration for database connections

### Database Migration
- Drizzle Kit for schema migrations
- Push command for applying schema changes to database
- Schema files in `shared/schema.ts` for type sharing

### Environment Configuration
- DATABASE_URL environment variable required for PostgreSQL connection
- NODE_ENV for environment-specific behavior
- Development and production build scripts in package.json

The application is designed to be easily deployable on platforms like Replit, with clear separation of concerns and a scalable architecture that can grow from development to production use.