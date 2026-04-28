# Chomoe Production Team CRM Architecture

## Product direction

This Next.js implementation delivers:

- A public technical hiring questionnaire
- An internal CRM dashboard
- A recruitment pipeline
- Team assignment, notes, communication logging, and technical evaluation
- Protected admin login for the internal team

The UI is built on Next.js App Router with local persistence for CRM state so the workflow can be validated quickly before connecting a real backend and database.

## Core entities for the real system

When this moves to production, the backend should center on these entities:

- `registration_categories`
  - Examples: technical, media, volunteers, community, events
- `form_schemas`
  - Category-specific sections and questions
- `applications`
  - Raw submission record tied to a category and schema version
- `profiles`
  - The CRM-level person record created from each submission
- `pipeline_stages`
  - New, Reviewed, Contacted, Interview, Accepted, Rejected
- `profile_assignments`
  - Internal team ownership
- `profile_notes`
  - Internal-only notes
- `communication_logs`
  - Contact channel, result, follow-up date, summary
- `evaluations`
  - Structured technical review and final decision
- `team_members`
  - Internal users managing the recruitment workflow

## Recommended next backend stack

If we continue this inside a real app, the next step should be:

1. Add a backend API and database.
2. Store form definitions separately from profile workflow data.
3. Convert the technical questionnaire into schema-driven rendering.
4. Add authentication and role-based permissions for internal team members.
5. Add profile timeline history and audit logging.
6. Add messaging integrations later for WhatsApp, email, and reminders.

## Front-end implementation notes

Current files:

- `app/`: routes for the public site, technical application, login, dashboard, and auth APIs
- `components/`: reusable UI sections and CRM client components
- `lib/`: CRM types, seed data, and utility helpers
- `proxy.ts`: protects admin dashboard routes
- `.env.example`: admin credential configuration template

## Why this structure scales

The important idea is separation:

- Public forms collect category-specific answers
- CRM profiles handle the shared internal workflow
- Evaluations and communication stay attached to the applicant profile, not the public form

That separation makes it much easier to add future registration types without rebuilding the internal dashboard each time.
