var holo = document.createElement('div'),
    t0,
    period,
    next;

function updateHolo(holo, t0, period) {
  holo.style.width = Math.max(0, Math.min((Date.now() - t0) / (period * 60 * 1000) * 100, 100)) + '%';
}

function loop() {
  next = window.requestAnimationFrame(function _loop() {
    updateHolo(holo, t0, period);
    next = window.requestAnimationFrame(_loop);
  });
}

holo.id = 'ext-pacer-holo';
holo.style.position = 'fixed';
holo.style.top = '0';
holo.style.left = '0';
holo.style.height = '2px';
// holo.style['background-color'] = '#9aecf0';
// holo.style['box-shadow'] = '0 0 10px rgba(154,236,240,0.5)';
holo.style['background-color'] = '#e03333';
holo.style['box-shadow'] = '0 0 10px rgba(224,51,51,0.5)';
holo.style['z-index'] = '2147483647'; // max z-index for many browsers

chrome.storage.local.get(['period', 'lastAlarm'], function (items) {
  console.log(items);
  period = items.period;
  t0 = items.lastAlarm;
  updateHolo(holo, t0, period);

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area == 'local') {
      console.log(changes);
      period = changes.period ? changes.period.newValue : period;
      t0 = changes.lastAlarm ? changes.lastAlarm.newValue : t0;
      updateHolo(holo, t0, period);
    }
  });

  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;
  loop();

  document.addEventListener('webkitvisibilitychange', function() {
    if (document.webkitHidden) {
      window.cancelAnimationFrame(next); 
      // console.log('paused');
    } else {
      loop();
      // console.log('resumed');
    }
  });
});

document.body.appendChild(holo);