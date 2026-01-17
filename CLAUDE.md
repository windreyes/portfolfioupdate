# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a bilingual (English/Spanish) portfolio website built with Next.js 15.4, React 19, TypeScript, and Tailwind CSS v4. The site showcases creative work across multiple categories (design, illustration, photo/video, tattoo) with an admin panel for content management via Cloudinary.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server (uses $PORT env variable)
npm start

# Run ESLint (configured to ignore during builds)
npm run lint
```

## Environment Variables

Required environment variables (see `.env` file):

**Admin Authentication:**
- `SESSION_SECRET` - JWT signing secret for admin authentication
- `ADMIN_EMAIL` - Admin login email
- `ADMIN_PASSWORD` - Admin login password

**Cloudinary Integration:**
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Public cloud name (used client-side)
- `CLOUDINARY_API_KEY` - Cloudinary API key (server-only)
- `NEXT_PUBLIC_CLOUDINARY_API_KEY` - Public API key (client-side uploads)
- `CLOUDINARY_API_SECRET` - Cloudinary API secret (server-only)
- `CLOUDINARY_FOLDER` - Base folder name in Cloudinary (default: "portfolioW")

## Architecture

### App Structure (Next.js App Router)

**Public Routes:**
- `/` - Home page
- `/me` - About/bio page
- `/design` - Design portfolio
- `/illustration` - Illustration & animation work
- `/photo` - Photography & video portfolio
- `/tatto` - Tattoo work
- `/contact` - Contact information

**Protected Admin Routes:**
- `/admin/login` - Admin authentication (uses Server Actions)
- `/admin/upload` - Content management interface (upload/delete media via Cloudinary)

### Authentication & Middleware

Authentication is implemented using JWT tokens with the `jose` library:
- [middleware.ts](middleware.ts) protects `/admin/*` routes (except `/admin/login`)
- [app/admin/login/actions.ts](app/admin/login/actions.ts) contains `loginAction` Server Action
- JWT tokens stored in `admin_token` httpOnly cookie (7-day expiration)
- Token verification required for protected API routes

### Internationalization (i18n)

Custom implementation without routing changes:
- [app/i18n/dictionaries.ts](app/i18n/dictionaries.ts) defines `dict` object with `en` and `es` translations
- [app/context/changeLanguage.tsx](app/context/changeLanguage.tsx) provides `LanguageProvider` context:
  - `language` state (type: `Lang = "en" | "es"`)
  - `t()` function for translations with simple string interpolation
  - `isHonest` toggle for alternate content (honest vs. professional descriptions)
  - Sidebar UI for language selection (animated with Framer Motion)
  - Preferences persisted to localStorage
- Use `useLanguageContext()` hook to access translations in components

### Cloudinary Integration

Image/video management with client-side uploads and server-side deletions:
- [app/api/uploads/route.ts](app/api/uploads/route.ts) - POST endpoint generates signed upload credentials
  - Accepts `section` in request body (whitelisted: "me", "design", "illustration", "photo-video", "tatto")
  - Returns signature, timestamp, and folder path for client-side upload
- [app/api/cloudinary/delete/route.ts](app/api/cloudinary/delete/route.ts) - DELETE endpoint removes resources (requires auth)
- Files organized into folders: `${CLOUDINARY_FOLDER}/${section}`
- `next-cloudinary` package used for optimized image components
- [next.config.ts](next.config.ts) configures remote image patterns for Instagram CDN and Cloudinary

### UI Components

Built with shadcn/ui (New York style variant):
- Component library in [components/ui/](components/ui/)
- [components.json](components.json) defines aliases: `@/components`, `@/lib`, `@/ui`
- Tailwind CSS v4 with `@tailwindcss/postcss` plugin
- Lucide React for icons
- Framer Motion (`motion` package) for animations
- `next-themes` for theme management
- Custom carousels using `embla-carousel-react`

### Path Aliases

TypeScript configured with `@/*` alias mapping to root:
- `@/components` → components
- `@/lib` → lib utilities
- `@/app` → app directory

## Key Technical Details

**Next.js Configuration:**
- Development uses Turbopack (`--turbopack` flag)
- Production start command expects `$PORT` environment variable
- ESLint ignored during builds (`ignoreDuringBuilds: true`)
- Image optimization configured for Instagram and Cloudinary domains with wildcard patterns

**TypeScript:**
- Target: ES2017
- Strict mode enabled
- JSX preserved for Next.js compilation

**Styling:**
- Tailwind CSS v4 with PostCSS plugin
- `tw-animate-css` for animation utilities
- CSS variables enabled via components.json

**File Upload Flow:**
1. Client requests signed credentials from `/api/uploads`
2. Server returns signature with folder path
3. Client uploads directly to Cloudinary using credentials
4. Admin can delete via `/api/cloudinary/delete` (server-side with auth check)
