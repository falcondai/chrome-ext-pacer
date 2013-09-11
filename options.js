var periodElmt = document.getElementById('period'),
    volumeElmt = document.getElementById('volume'),
    perIndicator = document.getElementById('period-indicator'),
    volIndicator = document.getElementById('volume-indicator'),
    notificationElmt = document.getElementById('notification'),
    quoteElmt = document.getElementById('quote'),
    chime = document.getElementById('chime'),
    holoElmt = document.getElementById('holo'),
    testChimeHandle;

function clamp(x, lower, upper) {
  return Math.max(lower, Math.min(x, upper));
}

function enableToggles(x) {
  document.querySelectorAll('.group>a').map(function(e) {
    e.className = '';
  });
}

function disableToggles(x) {
  document.querySelectorAll('.group>a').map(function(e) {
    e.className = 'disabled';
  });
}

NodeList.prototype.map = Array.prototype.map;

periodElmt.onchange = function (init) {
  var period;
  if (init !== true) {
    period = Math.max(1, +this.value);
    localStorage.setItem('period', period);
    chrome.storage.local.set({
      period: period,
      lastAlarm: Date.now()
    });
    chrome.alarms.create('pace', {
      periodInMinutes: period
    });
  } else {
    period = localStorage.getItem('period');
    this.value = period;
  }
  perIndicator.textContent = period + ' minutes';
};

volumeElmt.onchange = function (init) {
  var volume;
  if (init !== true) {
    volume = clamp(+this.value, 0, 1);
    localStorage.setItem('volume', volume);
  } else {
    volume = localStorage.getItem('volume');
    this.value = volume;
  }
  if (volume > 0) {
    volIndicator.textContent = Math.ceil(volume * 100) + '%';
    chime.volume = volume;
    if (init != true) {
      testChimeHandle = testChimeHandle || setTimeout(function () {
          console.log('play chime');
          chime.pause();
          chime.currentTime = 0;
          chime.play();
          testChimeHandle = undefined;
        }, 500);
    }
  } else {
    volIndicator.textContent = 'muted';
  }
};

notificationElmt.onchange = function () {
  localStorage.setItem('show notifications', this.checked);
  quoteElmt.disabled = !this.checked;
};

quoteElmt.onchange = function () {
  localStorage.setItem('quote', this.value);
};

holoElmt.onchange = function () {
  if (holoElmt.checked) {
    chrome.permissions.request({
      permissions: ['tabs'],
      origins: [
        'https://*/*',
        'http://*/*'
      ],
    }, function(granted) {
      if (granted) {
        console.log('holo permission granted');
        localStorage.setItem('holo', 'show');
        chrome.storage.local.set({holo: 'show'});
        enableToggles();
      } else {
        console.log('holo denied');
        holoElmt.checked = false;
      }
    });
  } else {
    chrome.permissions.remove({
      permissions: ['tabs'],
      origins: [
        'https://*/*',
        'http://*/*'
      ]
    }, function(removed) {
      if (removed) {
        console.log('holo permission removed');
        localStorage.setItem('holo', 'hide');
        chrome.storage.local.set({holo: 'hide'});
        disableToggles();
      } else {
        holoElmt.checked = true;
        alert('Error: ' + chrome.runtime.lastError);
        console.log(chrome.runtime.lastError);
      }
    });
  }
};

document.querySelector('#blue').onclick = function() {
  if (this.className.split(' ').indexOf('disabled') == -1) {
    chrome.storage.local.set({color: 'blue'});
  }
  return false;
};

document.querySelector('#red').onclick = function() {
  if (this.className.split(' ').indexOf('disabled') == -1) {
    chrome.storage.local.set({color: 'red'});
  }
  return false;
};

document.querySelector('#tick').onclick = function() {
  if (this.className.split(' ').indexOf('disabled') == -1) {
    chrome.storage.local.set({useTick: true});
  }
  return false;
};

document.querySelector('#continuous').onclick = function() {
  if (this.className.split(' ').indexOf('disabled') == -1) {
    chrome.storage.local.set({useTick: false});
  }
  return false;
};

document.getElementById('test').onclick = function () {
  chrome.runtime.sendMessage({test: 'alarm'});
};

window.onbeforeunload = function () {
  localStorage.setItem('quote', quoteElmt.value); 
};

// init UI
volumeElmt.onchange(true);
periodElmt.onchange(true);
notificationElmt.checked = localStorage.getItem('show notifications') == 'true';
quoteElmt.disabled = !notificationElmt.checked;
quoteElmt.value = localStorage.getItem('quote');

if (localStorage.getItem('holo') != 'hide') {
  holoElmt.checked = true;
  enableToggles();
} else {
  holoElmt.checked = false;
  disableToggles();
}

// set up action links
var eid = chrome.runtime.id,
    supportUrl = 'https://chrome.google.com/webstore/support/' + eid,
    storeUrl = 'https://chrome.google.com/webstore/detail/' + eid;
document.getElementById('ask').href = supportUrl + '#question';
document.getElementById('suggest').href = supportUrl + '#feature';
document.getElementById('report').href = supportUrl + '#bug';
document.getElementById('rate').href = storeUrl + '/reviews';

//share links
document.getElementById('facebook').href = 'https://www.facebook.com/sharer/sharer.php?u=' + storeUrl;
document.getElementById('twitter').href = 'https://twitter.com/intent/tweet?text=pacer chrome extension&via=falcondai&url=' + storeUrl;
document.getElementById('gplus').href = 'https://plus.google.com/share?url=' + storeUrl;

document.getElementById('share').onclick = function () {
  document.getElementById('social').className = document.getElementById('social').className == 'show' ? 'hide' : 'show';
  return false;
};