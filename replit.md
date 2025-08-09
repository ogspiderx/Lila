# Real-Time Chat Application

## Overview

This is a full-stack real-time chat application featuring a React frontend with TypeScript, an Express.js backend, and WebSocket integration for real-time messaging. The application uses in-memory storage for simplicity (though Drizzle ORM is configured for future database integration). The UI is built using shadcn/ui components with Tailwind CSS for styling. Key capabilities include real-time typing indicators, message editing and deletion, file attachments, message replies, personalized welcome screens, desktop notifications, and customizable Totoro-themed video backgrounds. The project aims to provide a robust, modern chat experience with a focus on performance, security, and user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure, separating client, server, and shared code.

**Technical Implementations & Design Patterns:**

*   **Frontend**: React 18 with TypeScript, Vite as build tool and development server.
*   **Backend**: Express.js server with TypeScript, integrated with Vite for development.
*   **Storage**: In-memory storage implementation with IStorage interface. Data resets when server restarts. Pre-configured test users (wale/xiu with password: password123).
*   **Real-time Communication**: WebSockets (`ws` library) for instant message delivery, typing indicators, and status updates.
*   **Styling**: Tailwind CSS with shadcn/ui component library, Framer Motion for animations.
*   **State Management**: TanStack Query v5 for server state management and caching.
*   **Authentication**: JWT tokens with bcrypt password hashing (12 rounds), rate limiting, and comprehensive server-side validation using Zod schemas. WebSocket connections require JWT authentication.
*   **Message Features**: Real-time messaging with typing indicators, message editing, message deletion (users can only delete their own messages), file attachments (up to 300MB), message replies, delivery status tracking, and seen receipts.
*   **File Handling**: Multer for file uploads, stored in `uploads/` directory with proper validation.
*   **Data Flow**:
    *   **Authentication**: User submits credentials, server validates with bcrypt, client stores JWT, redirects to chat.
    *   **Message Flow**: Client fetches history via REST API, real-time messages via WebSocket with message normalization.
    *   **Client-Server Communication**: REST API for auth and history; WebSocket for real-time with message batching and optimization.
*   **Performance Optimization**: Server-side caching (user authentication), HTTP compression (Gzip), client-side optimization with React Query, WebSocket message batching, and component memoization.
*   **Security**: Helmet.js for security headers (CSP), progressive rate limiting (5 attempts then slower), input validation with Zod, WebSocket JWT authentication, bcrypt password hashing, file upload validation, and data sanitization.
*   **UI/UX Decisions**:
    *   Dark theme with emerald green accents and smooth transitions.
    *   Custom font integration (Dancing Script, Poppins, Inter) and professional typography hierarchy.
    *   Enchanted animations, floating hearts, magical sparkles, and glass morphism effects.
    *   Personalized welcome screen with user greeting and avatar.
    *   Gradient message bubbles with improved shadows and hover effects.
    *   Custom green highlight for text selection.
    *   Desktop notifications that trigger when the tab is not focused, with permission management and auto-close features.
    *   Notification sounds that respect user settings and play only when the tab is not focused.
    *   **Video Background System**: Customizable Totoro-themed video backgrounds with full controls for opacity, blur, brightness, contrast, and saturation. Settings persist in localStorage with real-time preview.

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