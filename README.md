# Lila - Real-Time Chat Application

A modern, full-stack real-time chat application built with React, Express.js, PostgreSQL, and WebSocket technology. Features a sleek dark theme, persistent authentication, desktop notifications, and sound alerts.

## 🚀 Features

- **Real-Time Messaging**: Instant message delivery using WebSocket connections
- **User Authentication**: Secure cookie-based authentication with session persistence
- **Desktop Notifications**: Native browser notifications when the tab isn't focused
- **Sound Notifications**: Audio alerts for new messages (with toggle control)
- **Message Persistence**: All messages stored in PostgreSQL database
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Dark theme with gradient backgrounds and smooth animations
- **Auto-Scroll**: Smart message scrolling with upward navigation capability

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe UI development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** component library for consistent design
- **Framer Motion** for smooth animations and transitions
- **TanStack Query** for server state management and caching
- **Wouter** for lightweight client-side routing

### Backend
- **Express.js** with TypeScript for robust API development
- **WebSocket (ws)** for real-time bidirectional communication
- **Passport.js** for authentication middleware
- **Cookie-based sessions** for secure user authentication

### Database & ORM
- **PostgreSQL** for reliable data persistence
- **Drizzle ORM** for type-safe database operations
- **@neondatabase/serverless** for database connectivity
- **Drizzle Kit** for schema migrations

### Development Tools
- **TypeScript** for type safety across the entire stack
- **ESBuild** for fast server-side bundling
- **Hot Module Replacement** for rapid development

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (automatically provided in Replit environment)
- Modern web browser with WebSocket support

## 🚦 Getting Started

### 1. Environment Setup

The application is configured to work seamlessly in the Replit environment with PostgreSQL automatically provisioned. The following environment variables are available:

- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment mode (development/production)

### 2. Installation

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push
```

### 3. Development

```bash
# Start the development server
npm run dev
```

This starts both the Express.js backend and Vite frontend development server on the same port with hot module replacement enabled.

### 4. Production Build

```bash
# Build for production
npm run build

# Start production server  
npm start
```

## 👥 Test Users

The application comes with pre-configured test users for development:

- **Username**: `Wale` | **Password**: `password123`
- **Username**: `Xiu` | **Password**: `password123`

## 🏗️ Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── pages/          # Application pages/routes
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   └── index.html          # HTML template
├── server/                 # Backend Express.js application
│   ├── db.ts              # Database connection setup
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes and WebSocket setup
│   ├── storage.ts         # Data access layer
│   └── vite.ts            # Vite integration for production
├── shared/                 # Shared TypeScript types and schemas
│   └── schema.ts          # Database schema and type definitions
├── package.json           # Dependencies and scripts
├── drizzle.config.ts      # Database configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite build configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout  
- `GET /api/auth/user` - Get current user session

### Messages
- `GET /api/messages` - Retrieve message history
- WebSocket `/ws` - Real-time message broadcasting

## 🎨 UI Components

The application uses a comprehensive set of custom UI components built with shadcn/ui:

- **MessageBubble** - Styled message containers with sender identification
- **Form Components** - Input, textarea, button, and form validation
- **Navigation** - Responsive header with user controls
- **Notifications** - Toast notifications and desktop alerts
- **Layout** - Cards, separators, and responsive containers

## 🔐 Security Features

- **HTTP-only Cookies** - Secure session storage
- **CSRF Protection** - Cross-site request forgery prevention
- **Input Validation** - Zod schema validation for all user inputs
- **Session Timeout** - Automatic logout after 30 days of inactivity
- **Environment Isolation** - Separate development and production configurations

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Breakpoint System** - Tailwind CSS responsive utilities
- **Touch-Friendly** - Optimized for mobile interactions  
- **Flexible Layouts** - Adapts to different screen sizes
- **Performance** - Optimized bundle sizes and loading times

## 🔔 Notification System

### Desktop Notifications
- Automatic permission request on first visit
- Only shows when the browser tab is not focused
- Click notifications to focus the chat window
- Auto-dismiss after 5 seconds

### Sound Notifications  
- Optional audio alerts for new messages
- Respects browser audio policies
- Toggle control in the chat interface
- Only plays when tab is not active

## 🚀 Deployment

The application is designed for easy deployment on Replit:

1. **Automatic Environment** - PostgreSQL database automatically provisioned
2. **Zero Configuration** - Works out of the box in Replit environment  
3. **Hot Reloading** - Development workflow with instant updates
4. **Production Ready** - Optimized builds for deployment

### Manual Deployment

For deployment outside Replit:

1. Set up PostgreSQL database
2. Configure `DATABASE_URL` environment variable
3. Run `npm run build` 
4. Start with `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the excellent component library
- **Drizzle ORM** for type-safe database operations
- **Replit** for the seamless development environment
- **Tailwind CSS** for utility-first styling approach

---

**Built with ❤️ using modern web technologies**