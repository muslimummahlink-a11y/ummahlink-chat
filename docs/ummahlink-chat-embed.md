# Ummahlink Chat Embed

The deployed Tennahubsprema project exposes two routes: `/workspace` for private workspace access and `/chat` for public conversations. Clients can add a direct chat panel to an existing application with one script tag. The script creates a floating launcher and opens the public `/chat` experience in an iframe.

```html
<script
  src="https://earn.tennahubapps.com/ummahlink-chat.js"
  data-base-url="https://earn.tennahubapps.com"
  data-client-id="northstar-legal"
  data-accent="#28685a"
  defer
></script>
```

Use a stable identifier for each client application. The `data-base-url` and `data-accent` values are optional when the script is served from the production Ummahlink host.

The widget uses an iframe with microphone permission enabled so voice notes continue to work. It does not require a Supabase key, service-role key, or client secret in the customer application. Each visitor starts or resumes their own chat session in the browser, and message history is loaded from the chat backend when they return.

## Full-page option

For a full-page chat route instead of the floating widget:

```html
<iframe
  src="https://earn.tennahubapps.com/chat?embed=1&client=northstar-legal"
  title="Ummahlink chat"
  allow="microphone"
  style="width:100%;height:100vh;border:0"
></iframe>
```

## Deployment requirements

- Serve the chat host over HTTPS in production.
- The production chat host is `https://earn.tennahubapps.com`.
- Allow the client application origin to frame the chat in its CSP using `frame-src`.
- Keep the public chat RPCs and storage policies limited to the intended public-chat operations.
- Do not put Supabase service-role credentials or provider tokens in the embed snippet.
