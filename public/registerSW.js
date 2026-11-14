(function() {
  if (typeof window === 'undefined') return;
  var hadSwOrCache = false;
  var p1 = ('serviceWorker' in navigator)
    ? navigator.serviceWorker.getRegistrations().then(function(regs) {
        if (regs && regs.length > 0) hadSwOrCache = true;
        return Promise.all(regs.map(function(r) { return r.unregister().catch(function() {}); }));
      }).catch(function() {})
    : Promise.resolve();
  var p2 = ('caches' in window)
    ? caches.keys().then(function(keys) {
        if (keys && keys.length > 0) hadSwOrCache = true;
        return Promise.all(keys.map(function(k) { return caches.delete(k).catch(function() {}); }));
      }).catch(function() {})
    : Promise.resolve();
  Promise.all([p1, p2]).then(function() {
    if (hadSwOrCache && !sessionStorage.getItem('stba_sw_purged')) {
      sessionStorage.setItem('stba_sw_purged', '1');
      window.location.reload();
    }
  });
})();
