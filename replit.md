# Real-Time Chat Application

## Overview

This is a full-stack real-time chat application featuring a React frontend with TypeScript, an Express.js backend, PostgreSQL database with Drizzle ORM, and WebSocket integration for real-time messaging. The UI is built using shadcn/ui components with Tailwind CSS for styling. Key capabilities include real-time typing indicators, message editing and deletion, personalized welcome screens, and desktop notifications. The project aims to provide a robust, modern chat experience with a focus on performance, security, and user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure, separating client, server, and shared code.

**Technical Implementations & Design Patterns:**

*   **Frontend**: React with TypeScript, Vite as build tool.
*   **Backend**: Express.js server with TypeScript.
*   **Storage**: In-memory storage for temporary message storage. All data resets when server restarts.
*   **Real-time Communication**: WebSockets for instant message delivery.
*   **Styling**: Tailwind CSS with shadcn/ui component library.
*   **State Management**: TanStack Query for server state management.
*   **Authentication**: Secure JWT tokens with bcrypt hashing, rate limiting, and comprehensive server-side validation using Zod schemas. WebSocket connections require JWT authentication.
*   **Message Features**: Real-time messaging with typing indicators, message editing, message deletion (users can only delete their own messages), file attachments, and message replies.
*   **Data Flow**:
    *   **Authentication**: User submits credentials, server validates, client stores session, redirects to chat.
    *   **Message Flow**: Client fetches history via REST, real-time messages via WebSocket. New messages sent via WebSocket to all connected clients.
    *   **Client-Server Communication**: REST API for auth and history; WebSocket for real-time; TanStack Query for caching and sync.
*   **Performance Optimization**: Server-side caching (database queries, user authentication), HTTP compression (Gzip), client-side optimization with React Query, limited database queries, and component memoization.
*   **Security**: Helmet.js for security headers (Content Security Policy), progressive rate limiting, input validation, WebSocket security, strong password hashing, and data sanitization.
*   **UI/UX Decisions**:
    *   Dark theme with emerald green accents and smooth transitions.
    *   Custom font integration (Dancing Script, Poppins, Inter) and professional typography hierarchy.
    *   Enchanted animations, floating hearts, magical sparkles, and glass morphism effects.
    *   Personalized welcome screen with user greeting and avatar.
    *   Gradient message bubbles with improved shadows and hover effects.
    *   Custom green highlight for text selection.
    *   Desktop notifications that trigger when the tab is not focused, with permission management and auto-close features.
    *   Notification sounds that respect user settings and play only when the tab is not focused.

## External Dependencies

*   **Core Framework Dependencies**:
    *   React & React DOM
    *   Express.js
    *   TypeScript
    *   Vite
*   **Storage**:
    *   In-memory storage implementation
    *   No database dependencies required
*   **UI & Styling**:
    *   Tailwind CSS
    *   shadcn/ui
    *   Framer Motion
    *   Lucide React
*   **State Management & Communication**:
    *   TanStack Query
    *   WebSocket (`ws` library)
    *   Wouter (lightweight client-side routing)
*   **Form Handling & Validation**:
    *   React Hook Form
    *   Zod
    *   @hookform/resolvers