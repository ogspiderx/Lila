# Real-Time Chat Application

A modern, full-stack real-time chat application built with React, TypeScript, Express.js, and WebSockets. Features beautiful UI with video backgrounds, real-time messaging, typing indicators, file attachments, and comprehensive security.

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Rate limiting and comprehensive input validation
- Helmet.js security headers with Content Security Policy
- Session management with secure cookies
- Progressive rate limiting for API endpoints

### 💬 Real-Time Messaging
- Instant message delivery via WebSockets
- Real-time typing indicators
- Message editing and deletion (users can only delete own messages)
- File attachments with drag-and-drop support (up to 300MB)
- Message replies and threading
- Message delivery status (sent, delivered, seen)
- Message seen tracking with read receipts

### 🎨 Beautiful UI/UX
- Dark theme with emerald green accents
- Customizable Totoro-themed video backgrounds
- Video controls (opacity, blur, brightness, contrast, saturation)
- Gradient message bubbles with hover effects
- Smooth animations and transitions
- Glass morphism effects and floating elements
- Custom fonts (Dancing Script, Poppins, Inter)
- Desktop notifications with sound alerts
- Responsive design for all screen sizes

### 🔧 Technical Features
- TypeScript throughout (frontend and backend)
- In-memory storage (data resets on server restart)
- TanStack Query for state management and caching
- Zod schemas for data validation
- React Hook Form for form handling
- shadcn/ui component library with Tailwind CSS
- Framer Motion animations
- Express.js server with comprehensive middleware

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation & Development

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   This starts both the Express backend (port 5000) and Vite frontend in development mode.

3. **Access the application:**
   - Open your browser to the development URL
   - Use test accounts:
     - Username: `wale` Password: `password123`
     - Username: `xiu` Password: `password123`

### Production Build

```bash
npm run build  # Build both frontend and backend
npm start      # Start production server
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   └── main.tsx       # Application entry point
│   └── index.html
├── server/                 # Express.js backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # In-memory storage implementation
│   ├── db.ts              # Database configuration (unused)
│   └── vite.ts            # Vite development integration
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Zod schemas and TypeScript types
├── attached_assets/        # Video backgrounds and media files
├── uploads/               # File upload storage
├── package.json
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user info

### Messages
- `GET /api/messages` - Get message history
- `POST /api/messages` - Send new message
- `DELETE /api/messages/:id` - Delete message (own messages only)

### File Uploads
- `POST /api/upload` - Upload file attachment

### WebSocket Events
- Message broadcasting
- Typing indicators
- Message delivery status
- Message deletion notifications

## 🎯 Key Technical Decisions

### In-Memory Storage
- **Why:** Simplifies development and deployment
- **Trade-off:** Data resets on server restart
- **Alternative:** Easy migration to PostgreSQL with Drizzle ORM (already configured)

### WebSocket Authentication
- JWT tokens required for WebSocket connections
- Secure real-time communication
- Automatic reconnection with authentication

### Performance Optimizations
- Server-side caching for user authentication
- HTTP compression (Gzip)
- Component memoization on frontend
- Efficient WebSocket message batching
- TanStack Query for intelligent caching

### Security Measures
- Password hashing with bcrypt (12 rounds)
- Rate limiting (progressive: 5 attempts, then slower)
- Input sanitization and validation
- CORS configuration
- Security headers via Helmet.js
- File upload validation and size limits

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema (Drizzle)

## 🌟 Customization

### Video Backgrounds
- Add your own videos to `attached_assets/`
- Supports .mp4 format
- Configurable opacity, blur, and color adjustments
- Settings persist in localStorage

### Themes
- Modify colors in `client/src/index.css`
- Update Tailwind configuration in `tailwind.config.ts`
- Component styling via shadcn/ui

### Features
- Easy to extend message types in `shared/schema.ts`
- Add new API routes in `server/routes.ts`
- Custom React hooks in `client/src/hooks/`

## 📱 Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- WebSocket support required
- Desktop notification support optional

## 🤝 Contributing

This is a demonstration project showcasing modern web development practices with React, TypeScript, and real-time features. Feel free to explore the codebase and adapt it for your own projects.

## 📄 License

MIT License - feel free to use this project as a starting point for your own applications.