# Overview

This is a sales intelligence platform called "MarketEdge" that helps sales teams track competitor pricing and analyze market trends. The application provides comprehensive competitor analysis features including price tracking, market trend visualization, and competitor data management with role-based access control.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern React application using TypeScript for type safety
- **Wouter**: Lightweight client-side routing library instead of React Router
- **TanStack Query**: Data fetching and caching for API interactions
- **Vite**: Fast build tool and development server with hot module replacement
- **Tailwind CSS + shadcn/ui**: Utility-first CSS framework with pre-built component library
- **Recharts**: Chart library for data visualization (line charts, bar charts, pie charts)

## Backend Architecture
- **Express.js**: Node.js web framework handling REST API endpoints
- **TypeScript**: Full-stack type safety with shared schema definitions
- **Passport.js**: Authentication middleware with local strategy
- **Express Session**: Session-based authentication with PostgreSQL session store
- **Role-based Access Control**: Three user roles (admin, sales_manager, sales_rep) with different permissions

## Database Layer
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations with schema-first approach
- **Database Schema**: Includes users, competitors, products, competitor_pricing, and price_history tables
- **Migrations**: Schema versioning through Drizzle migrations

## Authentication & Authorization
- **Password Security**: Scrypt-based password hashing with salt
- **Session Management**: PostgreSQL-backed session storage
- **Protected Routes**: Client-side route protection based on authentication status
- **Role-based Permissions**: Different access levels for user management and data operations

## Core Features
- **KPI Dashboard**: Real-time metrics including competitor count, price differences, product tracking
- **Price Trend Analysis**: Historical price tracking with customizable timeframes
- **Competitor Management**: CRUD operations for competitor and product data
- **Data Visualization**: Interactive charts for market analysis and competitor comparison
- **User Management**: Admin interface for managing user roles and permissions

# External Dependencies

## Database
- **Neon PostgreSQL**: Serverless PostgreSQL database service
- **Connection Pooling**: Using @neondatabase/serverless for optimal connection management

## UI Components
- **Radix UI**: Unstyled, accessible UI primitives for components
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Component variant styling system

## Development Tools
- **ESBuild**: Fast JavaScript bundling for production builds
- **TSX**: TypeScript execution environment for development
- **PostCSS**: CSS processing with Tailwind CSS integration

## Session Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Data Processing
- **date-fns**: Date manipulation and formatting utilities
- **Drizzle-zod**: Schema validation integration between Drizzle and Zod

## Development Environment
- **Replit Integration**: Custom Vite plugins for Replit-specific development features
- **WebSocket Support**: For Neon database connections in serverless environment