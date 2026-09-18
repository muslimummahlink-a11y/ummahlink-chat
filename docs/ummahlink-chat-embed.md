# Ummahlink Chat Embed

Clients can add a direct chat panel to an existing application with one script tag. The script creates a floating launcher and opens the same public chat experience in an iframe.

```html
<script
  src="https://CHAT_HOST/ummahlink-chat.js"
  data-base-url="https://CHAT_HOST"
  data-client-id="northstar-legal"
  data-accent="#28685a"
  defer
></script>
```

Replace `CHAT_HOST` with the deployed Tennahub/Ummahlink chat host and use a stable identifier for each client application. The `data-accent` value is optional.

The widget uses an iframe with microphone permission enabled so voice notes continue to work. It does not require a Supabase key, service-role key, or client secret in the customer application. Each visitor starts or resumes their own chat session in the browser, and message history is loaded from the chat backend when they return.

## Full-page option

For a full-page chat route instead of the floating widget:

```html
<iframe
  src="https://CHAT_HOST/chat?embed=1&client=northstar-legal"
  title="Ummahlink chat"
  allow="microphone"
  style="width:100%;height:100vh;border:0"
></iframe>
```

## Deployment requirements

- Serve the chat host over HTTPS in production.
- Allow the client application origin to frame the chat in its CSP using `frame-src`.
- Keep the public chat RPCs and storage policies limited to the intended public-chat operations.
- Do not put Supabase service-role credentials or provider tokens in the embed snippet.
