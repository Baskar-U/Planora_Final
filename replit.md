# Planora - Event Planning Platform

## Overview

Planora is a comprehensive event planning platform that connects users with vendors and services for organizing perfect events. The application provides a marketplace where users can discover services, manage bookings, communicate with vendors, and get AI-powered assistance for event planning. Built as a full-stack application with React frontend and Express.js backend, it combines modern web technologies with a clean, user-friendly interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod schema validation for robust form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the entire stack
- **API Design**: RESTful API with clear resource-based endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod schemas shared between frontend and backend
- **Development**: Hot reload with Vite integration for seamless development experience

### Database Design
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **Schema Structure**:
  - Users: Profile management and authentication data
  - Services: Vendor offerings with categories, pricing, and location data
  - Orders: Booking and transaction management
  - Cart: Shopping cart functionality for multiple service bookings
  - Messages: Real-time communication between users and vendors
- **Data Validation**: Shared Zod schemas ensure consistency between client and server
- **Migrations**: Drizzle Kit for database schema versioning and deployment

### Authentication System
- **Provider**: Firebase Authentication for secure user management
- **Methods**: Email/password and Google OAuth integration
- **State Management**: Firebase Auth state persistence with React context
- **Security**: Session-based authentication with secure cookie handling

### Storage Strategy
- **Development**: In-memory storage implementation for rapid prototyping
- **Production**: PostgreSQL with connection pooling via Neon Database
- **File Storage**: Firebase Storage for profile images and service photos
- **Caching**: React Query provides intelligent caching and synchronization

## External Dependencies

### Core Infrastructure
- **Neon Database**: PostgreSQL hosting with serverless architecture
- **Firebase**: Authentication, real-time messaging, and file storage
- **Vercel**: Frontend deployment and static asset hosting

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **Replit**: Development environment with integrated tooling
- **TypeScript**: Static type checking across the entire codebase

### UI and Styling
- **Radix UI**: Accessible component primitives for complex interactions
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Consistent icon library for modern interface design
- **Google Fonts**: Typography with Inter and specialized fonts

### Third-party Services
- **TanStack Query**: Server state management with automatic caching
- **React Hook Form**: Performance-optimized form handling
- **Date-fns**: Date manipulation and formatting utilities
- **Zod**: Runtime type validation and schema definition

### Communication Features
- **Real-time Messaging**: Firebase Realtime Database for vendor communication
- **AI Assistant**: Integrated chatbot for event planning guidance
- **Email Notifications**: Firebase Functions for automated user communications