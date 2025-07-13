# Database Setup Guide

**Local PostgreSQL setup for AIPatternEnforcer template projects.**

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [PostgreSQL Installation](#postgresql-installation)
4. [Database Configuration](#database-configuration)
5. [pgvector Extension](#pgvector-extension)
6. [Prisma Setup](#prisma-setup)
7. [Environment Variables](#environment-variables)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)

## Overview

This guide walks through setting up PostgreSQL with pgvector for local AI development projects using the AIPatternEnforcer template.

### Requirements
- PostgreSQL 15+ (for pgvector support)
- pgvector extension for AI embeddings
- Prisma for database ORM
- Local development only (no production setup)

## Prerequisites

Ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- Admin access to install PostgreSQL

## PostgreSQL Installation

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

### Windows
1. Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer with default settings
3. Remember the password for postgres user
4. Add PostgreSQL bin to PATH

## Database Configuration

### 1. Create Database User
```bash
# Connect as postgres user
sudo -u postgres psql

# Create user for your app
CREATE USER aipattern WITH PASSWORD 'localdev123';

# Grant permissions
ALTER USER aipattern CREATEDB;

# Exit psql
\q
```

### 2. Create Development Database
```bash
# Connect as your new user
psql -U aipattern -d postgres

# Create database
CREATE DATABASE aipattern_dev;

# Connect to new database
\c aipattern_dev

# Verify connection
\l
```

## pgvector Extension

### Install pgvector
```bash
# macOS
brew install pgvector

# Ubuntu/Debian
sudo apt install postgresql-15-pgvector

# From source (all platforms)
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
make install
```

### Enable pgvector in Database
```sql
# Connect to your database
psql -U aipattern -d aipattern_dev

# Create extension
CREATE EXTENSION IF NOT EXISTS vector;

# Verify installation
\dx

# Test vector operations
SELECT '[1,2,3]'::vector;
```

## Prisma Setup

### 1. Initialize Prisma
```bash
# Install Prisma CLI
npm install -D prisma

# Initialize Prisma with PostgreSQL
npx prisma init --datasource-provider postgresql
```

### 2. Update Prisma Schema
Edit `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [vector]
}

// Example model with vector field
model Document {
  id        String   @id @default(cuid())
  content   String
  embedding Unsupported("vector(1536)")?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 3. Generate Prisma Client
```bash
# Generate client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init
```

## Environment Variables

### 1. Create .env.local
```bash
# Database connection
DATABASE_URL="postgresql://aipattern:localdev123@localhost:5432/aipattern_dev"

# Optional: Connection pool settings
DATABASE_POOL_TIMEOUT="30"
DATABASE_POOL_SIZE="10"
```

### 2. Update .env.example
```bash
# Database connection (local development)
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME"
```

## Verification

### 1. Test Database Connection
```bash
# Test with Prisma
npx prisma db push

# Verify tables created
npx prisma studio
```

### 2. Test in Application
Create `lib/db-test.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test vector operation
    const result = await prisma.$queryRaw`SELECT '[1,2,3]'::vector as test`
    console.log('✅ pgvector working:', result)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
```

Run test:
```bash
npx tsx lib/db-test.ts
```

## Troubleshooting

### Common Issues

#### 1. PostgreSQL not starting
```bash
# Check service status
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Check logs
tail -f /usr/local/var/log/postgresql@15.log  # macOS
sudo journalctl -u postgresql  # Linux
```

#### 2. Authentication failed
```bash
# Edit pg_hba.conf
# Location varies by system, find with:
psql -U postgres -c "SHOW hba_file"

# Change authentication method to md5 or trust for local
local   all   all   md5
host    all   all   127.0.0.1/32   md5
```

#### 3. pgvector not found
```sql
-- Check available extensions
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- If missing, ensure PostgreSQL 15+ is installed
SELECT version();
```

#### 4. Prisma migration issues
```bash
# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Force schema sync (development only)
npx prisma db push --force-reset
```

### Useful Commands

```bash
# PostgreSQL
psql -U aipattern -d aipattern_dev  # Connect to database
\l                                   # List databases
\dt                                  # List tables
\d+ table_name                       # Describe table
\q                                   # Quit

# Prisma
npx prisma studio                    # GUI database browser
npx prisma migrate dev               # Create migration
npx prisma db seed                   # Run seed script
```

## Next Steps

1. Create seed data script in `prisma/seed.ts`
2. Add vector search queries to your API
3. Configure connection pooling for better performance
4. Set up database backups (even for local dev)

---

**Note**: This setup is for LOCAL DEVELOPMENT ONLY. Do not use these configurations for production deployments.