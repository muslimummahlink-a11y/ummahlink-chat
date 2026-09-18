# Secure Integrations

## GitHub

The `github-sync` Edge Function is deployed with JWT verification enabled. It reads `GITHUB_TOKEN` only inside Supabase, synchronizes repositories into `github_repositories`, and never sends the token to the browser.

Required Supabase function secrets:

- `GITHUB_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY`

## Supabase Monitoring

The `supabase-monitor` Edge Function is deployed with JWT verification enabled. It checks a stored project URL, writes the account health and latency result to `supabase_accounts` and `monitoring_checks`, and keeps the service role key server-side.

Required Supabase function secret:

- `SUPABASE_SERVICE_ROLE_KEY`

## Credentials Vault

The `credentials` table is authenticated-only. Anonymous clients cannot read or write it. The browser stores only `secret_ref` metadata; secret values must live in a managed secret store or an encrypted server-side integration, never in React state or public rows.

## Client Portal

Portal members and network diagrams are authenticated-only. A portal UI should use Supabase Auth and enforce client/project ownership in RLS policies before publishing project records or files.
