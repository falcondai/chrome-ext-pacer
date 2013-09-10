var holo = document.createElement('div'),
    t0,
    period,
    next,
    useTick;

function updateHolo(holo, t0, t, period) {
  var periodInMs = period * 60 * 1000;
  holo.style.width = ((t - t0) % Math.ceil(periodInMs)) / periodInMs * 100 + '%';
}

function loop() {
  next = window.requestAnimationFrame(function _loop() {
    updateHolo(holo, t0, Date.now(), period);
    next = window.requestAnimationFrame(_loop);
  });
}

function tick() {
  updateHolo(holo, t0, period);
  next = setInterval(function() {
    updateHolo(holo, t0, Date.now(), period);
  }, 1000);
}

function visibilityChange() {
  if (document.webkitHidden) {
    if (useTick) {
      clearInterval(next);
    } else {
      window.cancelAnimationFrame(next); 
    }
    console.log('holo paused');
  } else {
    if (useTick) {
      tick();
    } else {
      loop();
    }
    console.log('holo resumed');
  }
}

function settingChange(changes, area) {
  if (area == 'local') {
    console.log(changes);
    period = changes.period ? changes.period.newValue : period;
    t0 = changes.lastAlarm ? changes.lastAlarm.newValue : t0;
    updateHolo(holo, t0, Date.now(), period);

    if (changes.useTick) {
      holoOff();
      useTick = changes.useTick.newValue;
      holoOn();
    }

    if (changes.color) {
      setColor(changes.color.newValue);
    }

    if (changes.holo) {
      if (changes.holo.newValue == 'hide') {
        holoOff();
      } else {
        holoOn();
      }
    }
  }
}

function holoOn() {
  if (useTick) {
    tick();
  } else {
    loop();
  }
  document.addEventListener('webkitvisibilitychange', visibilityChange);
  holo.style.display = 'block';
}

function holoOff() {
  if (useTick) {
    clearInterval(next);
  } else {
    window.cancelAnimationFrame(next); 
  }
  document.removeEventListener('webkitvisibilitychange', visibilityChange);
  holo.style.display = 'none';
}

function setColor(color) {
  if (color == 'red') {
    holo.style['background-color'] = '#e03333';
    holo.style['box-shadow'] = '0 0 10px rgba(224,51,51,0.5)';
  } else {
    holo.style['background-color'] = '#9aecf0';
    holo.style['box-shadow'] = '0 0 10px rgba(154,236,240,0.5)';
  }
}

// holo style config
holo.id = 'ext-pacer-holo';
holo.style.position = 'fixed';
holo.style.top = 0;
holo.style.left = 0;
holo.style.padding = 0;
holo.style.margin = 0;
holo.style.border = 'none';
holo.style.height = '2px';
holo.style.opacity = 1;
holo.style.transition = 'none';
holo.style['z-index'] = '2147483647'; // max z-index for many browsers

chrome.storage.local.get(['holo', 'period', 'lastAlarm', 'useTick', 'color'], function (items) {
  console.log(items);
  period = items.period;
  t0 = items.lastAlarm;
  useTick = items.useTick;
  setColor(items.color);
  updateHolo(holo, t0, Date.now(), period);

  chrome.storage.onChanged.addListener(settingChange);

  // normalize HTML5 APIs
  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;
  
  if (items.holo == 'show') {
    holoOn();
  } else {
    holoOff();
  }
});