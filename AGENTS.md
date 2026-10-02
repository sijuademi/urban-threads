# AGENTS.md

## Project Overview

This project is a functional e-commerce website for Urban Threads,
a small clothing business.

## Product Requirements

The complete product requirements are documented in `PRD.md`.

Before implementing a feature:

1. Read `PRD.md`.
2. Follow the requirements defined there.
3. Do not introduce features that conflict with the PRD.
4. If a requirement is ambiguous, ask for clarification rather than
   making a major architectural decision.

## Technology Stack

- React
- Vite
- Supabase
- PostgreSQL
- Google OAuth
- Supabase Edge Functions
- Mailgun
- Vercel

## Development Rules

- Use reusable React components.
- Keep components small and focused.
- Do not hard-code secrets.
- Never commit `.env` files or API keys.
- Use Supabase Row Level Security.
- Keep authentication logic separate from UI components.
- Validate user input.
- Do not modify the database schema without documenting the change.

## Security

Never expose:

- Mailgun API keys
- Supabase secret/service-role keys
- Google OAuth client secrets

Browser-accessible environment variables must only contain
values intended to be exposed to the client.

## Implementation Priority

Follow this order:

1. Shop concept and PRD
2. Product/shop UI
3. Authentication
4. Database
5. Cart and checkout
6. Persistent orders
7. Mailgun confirmation email
8. Authentication/order persistence testing
9. Deployment
10. Production end-to-end testing

## Completion Rule

Do not consider the project complete merely because the UI works.

The application must:

- authenticate users
- persist orders
- survive logout/re-login
- send confirmation emails
- work in production
- pass the complete end-to-end test
