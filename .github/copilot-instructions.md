# AI Agent Instructions for JSON Crack

## Project Overview
JSON Crack is a Next.js-based web application for visualizing and manipulating JSON data. The project uses React for UI, Reaflow for graph visualization, Monaco Editor for code editing, and Zustand for state management.

## Key Architecture Components

### Core Features (`src/features/`)
- **Editor**: Contains visualization components and tools
  - `LiveEditor.tsx`: Main editor component combining text and graph views
  - `TextEditor.tsx`: Monaco-based JSON editor
  - `views/GraphView/`: Graph visualization components using Reaflow
  - `Toolbar/`: Editor controls and tools

### Data Flow
1. JSON input → `src/store/useJson.ts` (central store)
2. Store triggers graph generation via `useGraph` store
3. Visualization rendered through Reaflow components

### State Management
- `src/store/`: Zustand stores for application state
  - `useJson.ts`: Manages JSON text content
  - `useConfig.ts`: User preferences and settings
  - `useModal.ts`: Modal dialogs state
  - `useFile.ts`: File handling state

## Development Workflow

### Setup & Running
```bash
pnpm install
pnpm dev  # Runs on http://localhost:3000
```

### Key Commands
- `pnpm build`: Production build
- `pnpm lint`: TypeScript check + ESLint
- `pnpm lint:fix`: Auto-fix linting issues

### Environment
- Node.js ≥18.x required
- Uses pnpm for package management
- Key env var: `NEXT_PUBLIC_NODE_LIMIT` (JSON node display limit)

## Project Conventions

### File Structure
- Feature-based organization in `src/features/`
- Shared utilities in `src/lib/utils/`
- Page components in `src/pages/` (Next.js convention)
- Global styles and constants in `src/constants/`

### State Management Pattern
- Use Zustand stores for global state
- Keep component state local when possible
- Store interactions through defined actions only

### Component Guidelines
- Use TypeScript for all new code
- Prefer functional components with hooks
- Mantine UI components for consistent styling
- Place modals in `src/features/modals/`

## Common Integration Points
- Monaco Editor: Text editing (`src/features/editor/TextEditor.tsx`)
- Reaflow: Graph visualization (`src/features/editor/views/GraphView/`)
- File format converters: `src/lib/utils/`
- External APIs: Always process data client-side for privacy

## Debugging Tips
- Check browser console for Sentry error reports
- Use React DevTools to inspect component state
- Monitor Zustand store changes via DevTools
- Graph rendering issues often relate to malformed JSON input
