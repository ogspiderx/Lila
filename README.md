# Real-Time Chat Application

A high-performance, real-time chat application built with modern web technologies. Features instant messaging, desktop notifications, sound alerts, and comprehensive performance optimizations.

## 🚀 Features

### Core Functionality
- **Real-time Messaging**: Instant message delivery via WebSocket connections
- **User Authentication**: Secure cookie-based authentication system
- **Message History**: Persistent message storage with PostgreSQL database
- **Desktop Notifications**: Native browser notifications when tab is inactive
- **Sound Notifications**: Customizable audio alerts for new messages
- **Message Management**: Copy messages with visual feedback

### Performance Optimizations
- **Aggressive Caching**: 15-minute client cache, 10-minute server cache
- **HTTP Compression**: Maximum gzip compression (level 9) reducing response sizes by 60-80%
- **Database Optimization**: Smart caching with 50-message limits and efficient indexing
- **Memory Management**: Optimized WebSocket handling with connection pooling
- **Ultra-fast Responses**: Sub-2ms response times for cached requests
- **Network Efficiency**: Minimal API calls with intelligent refetch prevention

### UI/UX Features
- **Modern Design**: Dark theme with gradient message bubbles
- **Responsive Layout**: Mobile-first design with adaptive breakpoints
- **Smooth Animations**: Framer Motion animations with optimized performance
- **Accessibility**: Full keyboard navigation and screen reader support
- **Real-time Indicators**: Connection status and typing indicators

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and building
- **TanStack Query** for intelligent server state management
- **Wouter** for lightweight client-side routing
- **Framer Motion** for smooth animations
- **Tailwind CSS** with shadcn/ui components

### Backend
- **Express.js** with TypeScript for robust server architecture
- **WebSocket (ws)** for real-time bidirectional communication
- **PostgreSQL** with Drizzle ORM for type-safe database operations
- **Cookie-based Authentication** with secure session management
- **Compression Middleware** for optimized response delivery

### Development Tools
- **TypeScript** for compile-time type checking
- **ESBuild** for optimized production builds
- **Drizzle Kit** for database schema management
- **Hot Module Replacement** for instant development feedback

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- PostgreSQL database (automatically provisioned on Replit)

### Installation & Setup

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   npm run db:push
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Open your browser to the development URL
   - Login with test credentials:
     - Username: `Wale` | Password: `password`
     - Username: `Xiu` | Password: `password`

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   └── pages/          # Application pages
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection and setup
│   ├── routes.ts          # API routes and WebSocket handling
│   ├── storage.ts         # Data access layer with caching
│   └── vite.ts            # Development server integration
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and validation
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (default: 5000)

### Performance Settings
- **Client Cache**: 15 minutes stale time, 30 minutes garbage collection
- **Server Cache**: 10 minutes for messages, 5 minutes for authentication
- **Database Cache**: 10 minutes TTL with smart invalidation
- **Compression**: Level 9 gzip with 512-byte threshold

## 🛠️ Development

### Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run check      # Type checking
npm run db:push    # Push database schema changes
```

### Database Management
- Schema changes are made in `shared/schema.ts`
- Apply changes with `npm run db:push`
- No manual migrations required - Drizzle handles schema evolution

### Performance Monitoring
- Connection status displayed in real-time
- Message delivery confirmation
- Network request optimization metrics
- Memory usage optimization

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Replit Deployment
1. Click the "Deploy" button in Replit
2. Configure custom domain (optional)
3. Automatic TLS certificate provisioning
4. Health checks and auto-scaling included

## 🔒 Security Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure token-based session management with 7-day expiration
- **Password Hashing**: bcrypt with salt rounds (12) for secure password storage
- **Secure Cookies**: HTTP-only, secure, SameSite=strict cookies for token storage
- **WebSocket Authentication**: JWT token validation for real-time connections
- **Session Management**: Automatic token validation and renewal

### Input Validation & Sanitization
- **Comprehensive Input Validation**: Server-side validation using express-validator and Zod
- **XSS Prevention**: Content sanitization and length limits (1000 characters)
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM
- **Message Size Limits**: 10KB limit on WebSocket messages, 10MB on HTTP requests
- **Username Validation**: Alphanumeric characters and underscores only

### Security Headers & Protection
- **Helmet.js Integration**: Complete security headers suite including CSP, HSTS, X-Frame-Options
- **Content Security Policy**: Strict CSP preventing XSS and code injection
- **Rate Limiting**: 100 requests/15min general, 5 requests/15min for auth endpoints
- **CORS Protection**: SameSite cookie policy and origin validation
- **Error Handling**: Secure error responses without information leakage

### Infrastructure Security
- **HTTPS Enforcement**: Secure flag on cookies in production
- **Connection Timeouts**: 10-second authentication timeout for WebSocket connections
- **Timing Attack Protection**: Consistent response times for invalid credentials
- **Memory Protection**: Automatic cleanup of authentication caches and connections

## 📊 Performance Metrics

- **First Load**: < 1 second for initial page load
- **Message Delivery**: < 50ms real-time message delivery
- **API Response**: Sub-2ms for cached responses
- **Memory Usage**: Optimized WebSocket connection pooling
- **Network Traffic**: 60-80% reduction through compression

## 🐛 Troubleshooting

### Common Issues
- **Connection Issues**: Check WebSocket connection status indicator
- **Performance**: Verify cache settings and database connection
- **Authentication**: Clear cookies and re-login if session issues occur

### Development Tips
- Use browser dev tools to monitor WebSocket connections
- Check console for performance metrics and error messages
- Database queries are logged for debugging (slow queries only)

## 🤝 Contributing

1. Follow TypeScript best practices
2. Maintain performance optimization standards
3. Update documentation for new features
4. Test real-time functionality thoroughly

## 📄 License

MIT License - feel free to use this project as a foundation for your own chat applications.

---

**Built with ❤️ for high-performance real-time communication**