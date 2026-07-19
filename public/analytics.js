/* Cookieless, privacy-first analytics beacon for ritvikmaini.com.
   No cookies, no localStorage, no persistent identifier. Posts session events
   to the same-origin /px collector. Session grouping uses an ephemeral in-memory
   id that vanishes when the tab closes. Respects Do Not Track. */
(function () {
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.msDoNotTrack === "1") return;

  var EP = "/px";
  var sid = (crypto && crypto.randomUUID && crypto.randomUUID()) ||
            (String(Date.now()) + Math.random().toString(36).slice(2));
  var start = Date.now();
  var maxScroll = 0;
  var ended = false;

  var params = new URLSearchParams(location.search);
  var ref = params.get("ref") || params.get("utm_source") || null;

  function base() {
    return {
      sid: sid,
      referrer: document.referrer || null,
      ref: ref,
      tz: (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return null; } })(),
      lang: navigator.language || null,
      screen: (screen.width || 0) + "x" + (screen.height || 0),
    };
  }

  function send(data) {
    try {
      var payload = JSON.stringify(Object.assign(base(), data));
      if (navigator.sendBeacon) navigator.sendBeacon(EP, payload);
      else fetch(EP, { method: "POST", body: payload, keepalive: true });
    } catch (e) { /* never break the page */ }
  }

  // Initial pageview.
  send({ type: "pageview", section: location.pathname });

  // Section opens (virtual pageviews) — emitted by the app on overlay open.
  window.addEventListener("analytics:view", function (e) {
    send({ type: "section_open", section: (e.detail && e.detail.section) || null });
  });

  // Scroll depth (max % reached), throttled with rAF.
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement;
      var pct = h.scrollHeight > h.clientHeight
        ? Math.round((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100) : 100;
      if (pct > maxScroll) maxScroll = Math.min(100, pct);
      ticking = false;
    });
  }, { passive: true });

  // Outbound / redirect-link / résumé-download clicks.
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.href || "";
    var external = a.host && a.host !== location.host;
    var isRedirect = /\/(github|linkedin)(\/|\?|$)/.test(a.pathname || "");
    var isDownload = /\.pdf($|\?)/i.test(href);
    if (external || isRedirect || isDownload) {
      send({ type: "outbound", href: href, section: (a.textContent || "").trim().slice(0, 40) });
    }
  }, true);

  // Heartbeat while visible — bounds dwell if the tab is closed abruptly.
  setInterval(function () {
    if (document.visibilityState === "visible") {
      send({ type: "heartbeat", duration_ms: Date.now() - start, scroll_pct: maxScroll });
    }
  }, 15000);

  // Session end.
  function end() {
    if (ended) return;
    ended = true;
    send({ type: "session_end", duration_ms: Date.now() - start, scroll_pct: maxScroll });
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") end();
  });
  window.addEventListener("pagehide", end);
})();
