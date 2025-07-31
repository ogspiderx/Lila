# Real-Time Chat Application

A modern, full-stack real-time chat application built with React, Express.js, PostgreSQL, and WebSockets. Features instant messaging, user authentication, and a beautiful dark theme interface.

## ✨ Features

- **Real-time messaging** - Instant message delivery using WebSockets
- **User authentication** - Secure login with persistent sessions
- **Modern UI** - Beautiful dark theme with shadcn/ui components
- **Type safety** - Full TypeScript implementation across the stack
- **Database persistence** - Messages and users stored in PostgreSQL
- **Responsive design** - Works seamlessly on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up your database**:
   - Create a PostgreSQL database
   - Set the `DATABASE_URL` environment variable
   - Push the schema:
     ```bash
     npm run db:push
     ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSockets (ws library)
- **UI**: Tailwind CSS, shadcn/ui components
- **State Management**: TanStack Query
- **Forms**: React Hook Form with Zod validation
- **Routing**: Wouter (lightweight React router)

### Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes and WebSocket setup
│   ├── db.ts             # Database connection
│   ├── storage.ts        # Data access layer
│   └── vite.ts           # Vite integration
├── shared/               # Shared TypeScript types and schemas
│   └── schema.ts         # Database schema and validation
└── package.json          # Dependencies and scripts
```

## 🔐 Authentication

The application uses cookie-based authentication with the following test users:

- **Username**: `Wale` | **Password**: `password123`
- **Username**: `Xiu` | **Password**: `password456`

Sessions persist for 30 days with secure HTTP-only cookies.

## 📡 Real-time Features

### WebSocket Communication

- **Connection**: Automatic WebSocket connection on chat page load
- **Message Broadcasting**: Real-time message delivery to all connected users
- **Typing Indicators**: See when other users are typing
- **Connection Management**: Automatic reconnection handling

### Message Flow

1. User sends message via the chat interface
2. Message is validated and stored in PostgreSQL
3. Message is broadcast to all connected WebSocket clients
4. All users see the new message instantly

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Apply database schema changes

### Environment Variables

Required environment variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=development|production
PORT=5000
```

### Development Workflow

1. **Frontend**: Vite dev server with hot reload and React Fast Refresh
2. **Backend**: tsx for TypeScript execution with automatic restart
3. **Database**: Drizzle Kit for schema management and migrations
4. **Types**: Shared TypeScript types ensure consistency across the stack

## 🚢 Deployment

### Production Build

```bash
npm run build
npm run start
```

The build process:
1. Vite builds the frontend to `dist/public/`
2. esbuild bundles the backend to `dist/index.js`
3. Production server serves both API and static files

### Platform Deployment

This application is optimized for deployment on:
- **Replit** (recommended)
- **Railway**
- **Render**
- **Heroku**
- **DigitalOcean App Platform**

## 🎨 UI Components

Built with shadcn/ui component library:

- **Form components**: Input, Button, Label with validation
- **Layout**: Card, Separator, ScrollArea
- **Feedback**: Toast notifications, Loading states
- **Navigation**: Responsive design with mobile support

## 🔧 Customization

### Styling

- **Colors**: Customize the theme in `client/src/index.css`
- **Components**: Extend shadcn/ui components in `client/src/components/ui/`
- **Layout**: Modify page layouts in `client/src/pages/`

### Backend

- **Routes**: Add new API endpoints in `server/routes.ts`
- **Database**: Extend schema in `shared/schema.ts`
- **Storage**: Modify data access layer in `server/storage.ts`

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the [Issues](../../issues) page
- Review the documentation in `replit.md`
- Ensure all environment variables are properly set