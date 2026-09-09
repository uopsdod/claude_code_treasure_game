# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies (both frontend and backend)
npm install
cd server && npm install && cd ..

# Start backend server (runs on http://localhost:3001)
cd server && npm run dev

# Start frontend development server (opens at http://localhost:3000)
npm run dev

# Build for production
npm run build
```

## Project Architecture

### Core Application
This is a **Full-Stack React + TypeScript + Vite + Express + SQLite** treasure hunting game with user authentication:

**Frontend (React)**
- **Entry Point**: `src/main.tsx` renders the main App component wrapped with AuthProvider
- **Main Game Logic**: `src/App.tsx` contains game state management, UI logic, and authentication modes
- **Authentication**: `src/contexts/AuthContext.tsx` provides global auth state management
- **UI Components**: `src/components/ui/` contains Radix UI-based components with shadcn/ui styling
- **Auth Components**: `src/components/auth/` contains LoginForm, SignupForm, and UserProfile components
- **Styling**: Uses **Tailwind CSS** with custom gradient backgrounds and animations
- **Animations**: Uses **Framer Motion** (imported as 'motion/react') for smooth transitions and interactions

**Backend (Express + SQLite)**
- **Server**: `server/server.js` - Express.js API server running on port 3001
- **Database**: `server/database.js` - SQLite database setup with users and game_scores tables
- **Authentication**: JWT-based auth with bcrypt password hashing
- **API Routes**: `server/routes/auth.js` (signup/signin) and `server/routes/scores.js` (game scores)

### Game Mechanics
The game implements a treasure hunting experience with three modes:

**Game Flow**
- Players click treasure chests to reveal either treasure (+$150) or skeleton (-$50)
- Auto-initialization: Game starts automatically on component mount
- End Conditions: Game ends when treasure is found OR all 3 boxes are opened
- Custom key cursor appears when hovering over closed treasure boxes

**Authentication Modes**
- **Guest Mode**: Play without account - scores are not saved
- **Authenticated Mode**: Sign in/up to save scores and track statistics
- **Profile Mode**: View game statistics, recent scores, and account management

**Data Persistence**
- Authenticated users: Scores saved to SQLite database with game statistics
- Guest users: No data persistence, play session only

### Asset Structure
```
src/
├── assets/              # Game images (treasure chests, key icon)
├── audios/              # Sound effects (chest opening sounds)
├── components/
│   ├── auth/            # Authentication components (LoginForm, SignupForm, UserProfile)
│   └── ui/              # Reusable UI components (Radix UI + shadcn/ui)
├── contexts/            # React contexts (AuthContext for global auth state)
├── services/            # API service functions (score saving, user data)
└── styles/              # Additional styling files

server/
├── routes/              # Express route handlers (auth, scores)
├── middleware/          # Auth middleware (JWT verification)
├── database.js          # SQLite database setup and table creation
└── server.js           # Main Express server configuration
```

### Key Dependencies

**Frontend**
- **React 18** with TypeScript
- **Framer Motion** for animations (import from 'motion/react')
- **Radix UI** components for accessible UI primitives
- **Tailwind CSS** for styling
- **Vite** for build tooling with SWC for fast compilation

**Backend**
- **Express.js** for API server
- **SQLite3** for database
- **bcryptjs** for password hashing
- **jsonwebtoken** for JWT authentication
- **express-validator** for input validation
- **cors** for cross-origin requests

### Development Notes
- **Build Target**: ES Next for modern browser support
- **Frontend Port**: Development server runs on port 3000
- **Backend Port**: API server runs on port 3001
- **Database**: SQLite file-based database (treasure_game.db)
- **Build Output**: Builds to `build/` directory
- **Path Aliases**: `@/` resolves to `src/` directory
- **Audio Integration**: Sound files are imported as modules and can be played programmatically
- **Authentication**: JWT tokens stored in localStorage, 24-hour expiration
- Always use descriptive variable name
- add comments on the top of every new function in one line to summarize the usage and you MUST document the inputs and output parameters

### API Endpoints

**Authentication**
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - User login
- `POST /api/auth/logout` - User logout (client-side token removal)

**Game Scores**
- `POST /api/scores` - Save game score (requires authentication)
- `GET /api/scores/user` - Get user's score history and statistics (requires authentication)
- `GET /api/health` - Server health check

### Database Schema

**users table**
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- email (TEXT UNIQUE)  
- password_hash (TEXT)
- created_at (DATETIME)

**game_scores table**
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER FOREIGN KEY)
- score (INTEGER)
- result (TEXT: 'Win', 'Tie', 'Loss')
- boxes_opened (INTEGER)
- treasure_found (BOOLEAN)
- played_at (DATETIME)