# Development Guide - Running Locally

This guide will help you set up and run the Presight Exercise project on your local machine.

![App Screenshot](./screen.png)

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the Project](#running-the-project)
4. [Development Workflow](#development-workflow)
5. [Environment Variables](#environment-variables)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Useful Commands](#useful-commands)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js** (v22.0.0 or higher)
  - Check version: `node --version`
  - Download: [https://nodejs.org/](https://nodejs.org/)
  
- **Yarn** (v1.22.0 or higher)
  - Check version: `yarn --version`
  - Install: `npm install -g yarn`
  - Or follow: [https://yarnpkg.com/getting-started/install](https://yarnpkg.com/getting-started/install)

- **Git**
  - Check version: `git --version`
  - Download: [https://git-scm.com/downloads](https://git-scm.com/downloads)

### Recommended Tools

- **VS Code** (or your preferred IDE)
- **Git** for version control
- **Chrome/Firefox** for testing the application

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd presight-execise
```

### 2. Install Dependencies

The project uses Yarn workspaces to manage dependencies for both client and server. Install all dependencies from the root:

```bash
yarn install
```

This command will:
- Install root-level dependencies (Lerna)
- Install client dependencies
- Install server dependencies

**Note**: This may take a few minutes on first install.

### 3. Verify Installation

Check that all dependencies are installed correctly:

```bash
# Check workspace structure
yarn workspaces info

# Verify TypeScript is available
yarn workspace presight-server exec tsc --version
yarn workspace presight-client exec tsc --version
```

---

## Running the Project

### Option 1: Run Both Client and Server (Recommended)

From the root directory, run both applications in parallel:

```bash
yarn dev
```

This will:
- Start the server on `http://localhost:3001`
- Start the client on `http://localhost:3000`
- Enable hot module replacement (HMR) for both

**Note**: The client will automatically proxy API requests to the server.

### Option 2: Run Client and Server Separately

#### Start the Server

```bash
# From root directory
yarn workspace presight-server dev

# Or from server directory
cd server
yarn dev
```

The server will start on `http://localhost:3001` with:
- API endpoints at `http://localhost:3001/api/*`
- WebSocket server at `http://localhost:3001` (Socket.IO)

#### Start the Client

In a separate terminal:

```bash
# From root directory
yarn workspace presight-client dev

# Or from client directory
cd client
yarn dev
```

The client will start on `http://localhost:3000` with:
- Hot module replacement enabled
- Automatic API proxy to server

### Access the Application

Once both are running, open your browser and navigate to:

```
http://localhost:3000
```

You should see the application with three main features:
1. **Person List** - Paginated list with virtual scrolling
2. **Stream Display** - Character-by-character streaming
3. **Process Requests** - WebWorker + WebSocket processing

---

## Development Workflow

### File Structure

```
presight-execise/
├── client/          # React frontend
│   └── src/        # Source files (edit here)
├── server/          # Node.js backend
│   └── src/        # Source files (edit here)
└── package.json     # Root workspace config
```

### Making Changes

#### Client Changes

1. Edit files in `client/src/`
2. Changes are automatically reflected (HMR)
3. Browser will auto-reload

#### Server Changes

1. Edit files in `server/src/`
2. Server will auto-restart (tsx watch mode)
3. API changes take effect immediately

### Building for Production

#### Build Server

```bash
yarn workspace presight-server build
```

Output: `server/dist/`

#### Build Client

```bash
yarn workspace presight-client build
```

Output: `client/dist/`

#### Build Both

```bash
yarn build
```

### Running Production Builds

#### Server

```bash
yarn workspace presight-server start
# Or
cd server
yarn start
```

#### Client

```bash
yarn workspace presight-client preview
# Or
cd client
yarn preview
```

---

## Environment Variables

### Server Environment Variables

Create a `.env` file in the `server/` directory (optional):

```env
# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:3000

# Storage Configuration (for future use)
STORAGE_TYPE=memory
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Queue Configuration (for future use)
QUEUE_TYPE=memory
REDIS_URL=redis://localhost:6379
```

### Client Environment Variables

Create a `.env` file in the `client/` directory (optional):

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

**Note**: Client env variables must be prefixed with `VITE_` to be accessible in the browser.

### Default Values

If no `.env` files are present, the application uses these defaults:
- Server port: `3001`
- Client port: `3000`
- API URL: `http://localhost:3001/api`
- Socket URL: `http://localhost:3001`

---

## Testing

### Run All Tests

```bash
# From root directory
yarn test
```

This runs tests for both client and server.

### Run Server Tests

```bash
yarn workspace presight-server test
# Or
cd server
yarn test
```

**Server Test Tools**:
- Jest - Test framework
- Supertest - HTTP endpoint testing

### Run Client Tests

```bash
yarn workspace presight-client test
# Or
cd client
yarn test
```

**Client Test Tools**:
- Vitest - Test framework
- React Testing Library - Component testing

### Watch Mode

Run tests in watch mode for development:

```bash
# Server
yarn workspace presight-server test:watch

# Client
yarn workspace presight-client test
# (Vitest runs in watch mode by default)
```

### Test Coverage

Generate coverage reports:

```bash
# Client
yarn workspace presight-client test:coverage

# Server (add coverage script if needed)
yarn workspace presight-server test --coverage
```

---

## Linting and Code Quality

### Run Linter

```bash
# Lint all code
yarn lint

# Lint server only
yarn workspace presight-server lint

# Lint client only
yarn workspace presight-client lint
```

### Auto-fix Issues

```bash
# Fix all issues automatically
yarn lint:fix

# Fix server only
yarn workspace presight-server lint:fix

# Fix client only
yarn workspace presight-client lint:fix
```

### Full Validation

Run linting, building, and testing:

```bash
# Validate everything
yarn validate

# Validate server only
yarn validate:server

# Validate client only
yarn validate:client
```

---

## Troubleshooting

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different port
# Set PORT environment variable
PORT=3002 yarn workspace presight-server dev
```

### Dependencies Not Installing

**Error**: `yarn install` fails

**Solutions**:
1. Clear Yarn cache:
   ```bash
   yarn cache clean
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules client/node_modules server/node_modules
   yarn install
   ```

3. Check Node.js version:
   ```bash
   node --version  # Should be v22+
   ```

### TypeScript Errors

**Error**: TypeScript compilation errors

**Solutions**:
1. Check TypeScript version:
   ```bash
   yarn workspace presight-server exec tsc --version
   ```

2. Rebuild:
   ```bash
   yarn workspace presight-server build
   ```

3. Check tsconfig.json configuration

### Client Not Connecting to Server

**Error**: API requests failing, CORS errors

**Solutions**:
1. Ensure server is running on port 3001
2. Check `client/vite.config.ts` proxy configuration
3. Verify `VITE_API_URL` in client `.env` file
4. Check browser console for errors

### WebSocket Connection Issues

**Error**: Socket.IO connection fails

**Solutions**:
1. Verify server is running
2. Check `CLIENT_URL` in server `.env` matches client URL
3. Check browser console for connection errors
4. Verify firewall isn't blocking WebSocket connections

### Module Not Found Errors

**Error**: `Cannot find module '...'`

**Solutions**:
1. Reinstall dependencies:
   ```bash
   yarn install
   ```

2. Clear build cache:
   ```bash
   # Server
   rm -rf server/dist
   
   # Client
   rm -rf client/dist client/node_modules/.vite
   ```

3. Check package.json for missing dependencies

---

## Useful Commands

### Root Level Commands

```bash
# Development
yarn dev                    # Start both client and server
yarn build                  # Build both
yarn test                   # Test both
yarn lint                   # Lint both
yarn lint:fix              # Auto-fix linting issues
yarn validate               # Full validation (lint + build + test)

# Workspace-specific
yarn workspace presight-server <command>  # Run server command
yarn workspace presight-client <command>   # Run client command
```

### Server Commands

```bash
cd server

yarn dev          # Development server with hot reload
yarn build        # Compile TypeScript
yarn start        # Run production build
yarn test         # Run tests
yarn test:watch   # Run tests in watch mode
yarn lint         # Lint code
yarn lint:fix     # Auto-fix linting issues
yarn validate     # Lint + build + test
```

### Client Commands

```bash
cd client

yarn dev          # Development server
yarn build        # Production build
yarn preview      # Preview production build
yarn test         # Run tests
yarn test:ui      # Run tests with UI
yarn test:coverage # Generate coverage report
yarn lint         # Lint code
yarn lint:fix     # Auto-fix linting issues
yarn validate     # Lint + build + test
```

---

## Project Structure Quick Reference

```
presight-execise/
│
├── client/                    # React frontend
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/       # React components
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   └── vite.config.ts        # Vite configuration
│
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── storage/           # Storage abstraction
│   │   ├── queue/            # Queue abstraction
│   │   ├── workers/          # Worker threads
│   │   └── index.ts          # Entry point
│   ├── package.json
│   └── tsconfig.json         # TypeScript config
│
├── package.json               # Root workspace
├── lerna.json                 # Monorepo config
└── yarn.lock                  # Dependency lock
```

---

## Next Steps

After getting the project running:

1. **Read the Architecture**: See `ARCHITECTURE.md` for detailed architecture
2. **Read Scalability Guide**: See `SCALABILITY.md` for production considerations
3. **Explore the Code**: Start with `client/src/App.tsx` and `server/src/index.ts`
4. **Run Tests**: Ensure all tests pass
5. **Make Changes**: Follow development standards in `ARCHITECTURE.md`

---

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review error messages in terminal and browser console
3. Check that all prerequisites are installed correctly
4. Verify environment variables are set correctly
5. Review `ARCHITECTURE.md` for project structure

---

## Quick Start Checklist

- [ ] Node.js v22+ installed
- [ ] Yarn installed
- [ ] Repository cloned
- [ ] Dependencies installed (`yarn install`)
- [ ] Server running (`yarn workspace presight-server dev`)
- [ ] Client running (`yarn workspace presight-client dev`)
- [ ] Application accessible at `http://localhost:3000`
- [ ] All tests passing (`yarn test`)

---

Happy coding! 🚀
