# Real-Time Chat Application

## Overview

This is a full-stack real-time chat application built with a modern web stack. The application features a React frontend with TypeScript, an Express.js backend, PostgreSQL database with Drizzle ORM, and WebSocket integration for real-time messaging. The UI is built using shadcn/ui components with Tailwind CSS for styling.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Latest Updates)

### August 1, 2025 - Advanced Messaging Features Complete
- **Typing Indicators**: Real-time typing indicators with 300ms debounce and 3-second timeout
- **Message Editing**: Inline editing with contentEditable and "edited" indicator shown
- **Message Deletion**: Messages show "This message was deleted" with real-time sync
- **Enhanced WebSocket**: Improved connection handling with better error recovery
- **Login Performance**: Fixed loading issues and reduced API calls to prevent rate limiting
- **UI Improvements**: Streamlined inline editing interface with Enter/Escape shortcuts

### August 1, 2025 - Complete Romantic Redesign with Custom Fonts
- **Custom Font Integration**: Added Dancing Script for titles, Poppins for UI, Inter for messages
- **Enchanted Animations**: Floating hearts, magical sparkles, glass morphism effects throughout
- **Romantic Theme Complete**: Full dark theme with emerald green accents and smooth transitions
- **Updated README**: Comprehensive documentation with magical theme and all features explained
- **Typography System**: Professional font hierarchy with Google Fonts integration and fallbacks
- **Enhanced User Experience**: Smooth animations, hover effects, and romantic visual elements

### August 1, 2025 - Migration to Standard Replit Environment Complete
- **Migration Successfully Completed**: Project migrated from Replit Agent to standard Replit environment
- **PostgreSQL Database**: Created and configured PostgreSQL database with schema applied
- **Message Length Fix**: Updated message validation to allow up to 2000 characters (increased from 1000)
- **Test Users Ready**: Created test users (wale/xiu with password123) for immediate testing
- **Full Functionality Verified**: Real-time chat, WebSocket connections, and authentication all working properly

### January 31, 2025 - Comprehensive README Documentation Complete
- **Complete Project Documentation**: Created comprehensive README with all features, architecture, and deployment info
- **API Documentation**: Detailed request/response examples and endpoint descriptions
- **Security Features**: Documented comprehensive security implementations and best practices
- **Performance Metrics**: Added performance optimization details and benchmarks
- **Development Guide**: Complete setup, development, and deployment instructions

### January 31, 2025 - Personalized Welcome Screen Added  
- **Welcome Page Created**: Beautiful personalized welcome screen with user greeting and avatar
- **Smooth Animations**: Modern animations with time display and user stats
- **Enhanced UX Flow**: Updated routing from Login → Welcome → Chat for better user experience
- **Fixed Authentication**: Stabilized JWT tokens with consistent secret to prevent invalidation

### January 31, 2025 - Replit Agent to Environment Migration Completed
- **Migration Successful**: Project successfully migrated from Replit Agent to standard Replit environment
- **PostgreSQL Setup**: Database provisioned and schema applied with test users (wale/xiu with password123)
- **Authentication Fixed**: Resolved cookie settings for WebSocket authentication (httpOnly: false, sameSite: lax)
- **Security Headers**: Fixed Content Security Policy to allow Google Fonts and Replit scripts
- **Rate Limiting**: Configured trust proxy settings for Replit environment
- **WebSocket Real-time**: Fixed authentication flow for real-time messaging functionality
- **Full Stack Working**: Complete real-time chat application operational with login, messages, and WebSocket

## Recent Changes (Latest Updates)

### January 31, 2025 - Comprehensive Security Hardening Complete
- **Authentication Overhaul**: Replaced cookie-based auth with secure JWT tokens and bcrypt password hashing
- **Security Headers**: Implemented Helmet.js with strict Content Security Policy and security headers
- **Rate Limiting**: Added progressive rate limiting (100/15min general, 5/15min auth endpoints)
- **Input Validation**: Comprehensive server-side validation with express-validator and enhanced Zod schemas
- **WebSocket Security**: JWT authentication required for WebSocket connections with 10-second timeout
- **Password Security**: bcrypt with 12 salt rounds, timing attack protection for credential validation
- **Data Sanitization**: XSS prevention, message length limits, and secure error handling
- **Infrastructure Security**: HTTPS enforcement, secure cookie settings, and connection cleanup

### January 31, 2025 - Migration & Performance Optimization Complete
- **Migration Completed**: Successfully migrated from Replit Agent to standard Replit environment with PostgreSQL database
- **Performance Optimization**: Fixed excessive API calls and implemented efficient caching strategies
- **Server-side Caching**: Database queries cached for 10 minutes, user authentication cached for 5 minutes
- **HTTP Compression**: Maximum Gzip compression reducing response sizes by 60-80%
- **Client Optimization**: React Query with 15-minute stale time, disabled unnecessary refetching
- **Database Performance**: Limited queries to 50 recent messages with smart caching
- **Logging Optimization**: Reduced verbose logging and filtered out non-essential API calls
- **Component Memoization**: Message components optimized with React.memo for better performance

### January 31, 2025 - Project Documentation Complete
- **Comprehensive README**: Created detailed project documentation with setup instructions
- **Removed Typing Indicators**: Cleaned up typing indicator system per user request
- **Documentation Coverage**: Included technology stack, features, API endpoints, and deployment guide
- **Project Structure**: Documented complete file organization and architecture

### January 31, 2025 - Desktop Notifications Added
- **Desktop Notifications**: Added native browser notifications that only appear when tab isn't focused
- **Permission Management**: Smart notification permission handling with visual indicators
- **Auto-close & Click Actions**: Notifications auto-close after 5 seconds and focus the window when clicked
- **Proper Timing**: Desktop notifications only trigger for new messages when tab is not active

### January 31, 2025 - Notification Sound System Fixed
- **Fixed Notification Sounds**: Resolved duplicate sound playing and browser audio policy issues
- **Improved Audio Context Handling**: Added proper audio context initialization and error handling
- **Sound Toggle Functionality**: Sound notifications now properly respect the user's sound toggle setting
- **Better Timing**: Sounds only play when tab isn't focused and sound is enabled
- **Cleaned Up Code**: Removed unused sound notification hook and consolidated audio logic

### January 31, 2025 - Enhanced Color Scheme & UI Polish
- **Improved Color Palette**: Enhanced dark theme with better contrast and modern slate/emerald/amber color scheme
- **Message Bubble Redesign**: Beautiful gradient message bubbles with improved shadows and hover effects
- **Background Enhancement**: Added sophisticated gradient backgrounds throughout the application
- **Better Visual Hierarchy**: Improved typography and spacing for better readability
- **Fixed Default Cursor**: Restored standard cursor behavior removing custom cursor effects

### January 31, 2025 - Migration to Replit Environment Complete
- **Successful Migration**: Project migrated from Replit Agent to standard Replit environment
- **Database Setup**: PostgreSQL database provisioned and schema applied successfully
- **TypeScript Fixes**: Resolved all type compatibility issues between WebSocket and database messages
- **Authentication Working**: Cookie-based authentication fully functional with test users
- **WebSocket Real-time**: Real-time messaging system operational and tested
- **Security Implementation**: Proper client/server separation with secure practices

### January 31, 2025 - Migration to Replit Environment Complete
- **Successful Migration**: Project migrated from Replit Agent to standard Replit environment
- **Database Setup**: PostgreSQL database provisioned and schema applied successfully
- **TypeScript Fixes**: Resolved all type compatibility issues between WebSocket and database messages
- **Authentication Working**: Cookie-based authentication fully functional with test users
- **WebSocket Real-time**: Real-time messaging system operational and tested
- **Security Implementation**: Proper client/server separation with secure practices

### January 31, 2025 - Authentication & UI Updates
- **Cookie-Based Authentication**: Implemented persistent login sessions using secure HTTP-only cookies
- **Database Integration**: Added PostgreSQL database with Drizzle ORM for permanent data storage
- **Clean Message Design**: Removed gradient bubbles and custom cursor effects for professional appearance
- **Fixed Chat Scrolling**: Proper auto-scroll to latest messages with upward scrolling capability
- **Custom Text Selection**: Added custom green highlight styling for text selection
- **Timestamp Handling**: Fixed type compatibility between database Date objects and WebSocket number timestamps
- **Secure Session Management**: 30-day persistent login sessions with proper cookie security settings
- **Authentication Endpoints**: Complete login/logout API with proper error handling

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