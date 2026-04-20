(function(){
  'use strict';
  var VID_KEY = 'sz_vid';
  var API = '/api/tracking';

  function getVisitorId() {
    var id = localStorage.getItem(VID_KEY);
    if (!id) {
      id = 'v_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem(VID_KEY, id);
    }
    return id;
  }

  function send(event, meta) {
    var data = JSON.stringify({
      visitor_id: getVisitorId(),
      event: event,
      page: window.location.pathname,
      metadata: meta || {}
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(API, new Blob([data], { type: 'application/json' }));
    } else {
      fetch(API, { method: 'POST', body: data, headers: { 'Content-Type': 'application/json' }, keepalive: true });
    }
  }

  // Track page view
  send('pageview', { referrer: document.referrer, title: document.title });

  // Track scroll depth
  var maxScroll = 0;
  window.addEventListener('scroll', function() {
    var pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (pct > maxScroll) maxScroll = pct;
  });

  // Track time on page + max scroll on leave
  var startTime = Date.now();
  window.addEventListener('beforeunload', function() {
    send('page_exit', { time_seconds: Math.round((Date.now() - startTime) / 1000), scroll_depth: maxScroll });
  });
})();
