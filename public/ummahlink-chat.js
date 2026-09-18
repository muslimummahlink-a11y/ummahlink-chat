(function () {
  var script = document.currentScript;
  var baseUrl = script && script.getAttribute('data-base-url') || new URL(script && script.src || window.location.href).origin;
  var clientId = script && script.getAttribute('data-client-id') || 'client-app';
  var accent = script && script.getAttribute('data-accent') || '#28685a';
  var root = document.createElement('div');
  root.id = 'ummahlink-chat-widget';
  root.innerHTML = '<button type="button" aria-label="Open Ummahlink chat" data-chat-toggle>Chat with us</button><section aria-label="Ummahlink chat" data-chat-panel hidden><header><strong>Ummahlink</strong><button type="button" aria-label="Close Ummahlink chat" data-chat-close>×</button></header><iframe title="Ummahlink chat" allow="microphone" loading="lazy"></iframe></section>';
  document.body.appendChild(root);

  var toggle = root.querySelector('[data-chat-toggle]');
  var panel = root.querySelector('[data-chat-panel]');
  var close = root.querySelector('[data-chat-close]');
  var frame = root.querySelector('iframe');
  frame.src = baseUrl.replace(/\/$/, '') + '/chat?embed=1&client=' + encodeURIComponent(clientId);
  root.style.setProperty('--ummahlink-accent', accent);

  toggle.addEventListener('click', function () {
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
  });
  close.addEventListener('click', function () {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  });
}());
