# Creator Content Planner

## Project
Free Content Planning Web App for creators.

## Stack
Vite + Vanilla JS + CSS
Google Drive

## Architecture
See:
[docs/architecture/architecture.md](docs/architecture/architecture.md)

## Rules
See:
[.agents/rules/](.agents/rules/)

## Important
Google Drive sync is a critical subsystem.

Before modifying sync:
- Read [docs/architecture/architecture.md](docs/architecture/architecture.md)
- Read [.agents/rules/data-sync.md](.agents/rules/data-sync.md)

## Development
Run:
`npm run dev`

Build:
`npm run build`

## Principle
Prefer small, isolated changes.
Do not rewrite existing systems unless explicitly requested.

## Available Workflows
Trigger these by typing them in your prompt:
- `/new-feature`: Pipeline for creating a new feature safely.
- `/bug-fix`: Pipeline for investigating and fixing bugs.
- `/code-review`: Comprehensive, read-only code review.
