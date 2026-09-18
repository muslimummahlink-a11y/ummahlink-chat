# Tennahub Product Map

Tennahub is a private studio operating system for delivering client work, running infrastructure, and keeping commercial records in one workspace.

## Product Areas

| Area | Workspace surface | Primary records |
| --- | --- | --- |
| Overview | Today, workload, cash, appointments, alerts | projects, tasks, invoices, time entries, agenda items, activity events |
| Delivery | Projects, milestones, tasks, reviews, approvals | projects, milestones, tasks, reviews |
| Clients | Client profiles, contacts, notes, portal access | clients, client contacts, portal members |
| Files | Documents, quotations, receipts, handoffs | documents, quotes, receipts |
| Infrastructure | Client environments, domains, services, diagrams, plans | infrastructure assets, domains, network diagrams |
| Finance | Expenses, earnings, quotes, invoices, payment receipts | expenses, quotes, invoices, receipts |
| Calendar | Appointments, client calls, delivery schedule | agenda items, call logs |
| Integrations | GitHub repositories, Supabase projects, health checks | GitHub connections, repositories, Supabase accounts, monitoring checks |
| People | Team members, roles, ID cards | team members, identity cards |
| Private activity | Movements, calls, sensitive credentials | movements, call logs, credentials |

## Product Rules

- Every operational record belongs to a workspace and can optionally belong to a client and project.
- Money is stored as numeric amounts with an explicit currency; the default workspace currency is UGX.
- Client-facing records are explicitly marked publishable before they appear in a portal.
- Credentials, call logs, movements, and integration tokens require authenticated access and must never be public tables.
- GitHub and Supabase monitoring use server-side Edge Functions; browser code never receives provider secrets.
- Documents use Supabase Storage with database metadata and signed URLs.
- Network diagrams are stored as versioned JSON documents with SVG/PNG exports generated on demand.

## Delivery Order

1. Core delivery records: milestones, tasks, reviews, client notes.
2. Commercial records: expenses, quotes, payment receipts.
3. Client portal: scoped project view, approvals, files, invoices.
4. Infrastructure operations: domains, diagrams, provider monitoring.
5. Integrations: GitHub OAuth and Supabase account health checks.
6. People and private activity: team ID cards, movements, call logs, protected credentials.

## Current Coverage

The dashboard, Projects, Clients, Infrastructure, Finance, Calendar, Documents, and Credentials views are connected to Supabase. The next schema increment should add the delivery, commercial, portal, integration, people, and private-activity records listed above before those workflows are exposed in the UI.
