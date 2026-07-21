# Architecture

## Overview

**Kino** is a monorepo built with pnpm + Turborepo that aims to deliver a unified experience for tracking movies, TV shows, and related media across **web** and **mobile**.

### High-Level Structure

```bash
kino/
├── apps/
│   ├── web/           # Next.js 16 App Router + React 19
│   └── android/       # Expo (React Native) + Expo Router
├── packages/
│   ├── ui/            # Shared components (shadcn/ui + NativeWind)
│   ├── types/         # Shared TypeScript types
│   ├── api/           # tRPC routers or API clients
│   ├── db/            # Database schemas and models
│   ├── lib/           # Utilities and business logic
│   └── config/        # Shared configuration
├── docs/              # You are here
├── tools/             # Scripts and utilities
└── turbo.json
```
