function clamp(x, lower, upper) {
  return Math.max(lower, Math.min(x, upper));
}

var periodElmt = document.getElementById('period'),
    volumeElmt = document.getElementById('volume'),
    perIndicator = document.getElementById('period-indicator'),
    volIndicator = document.getElementById('volume-indicator'),
    notificationElmt = document.getElementById('notification'),
    quoteElmt = document.getElementById('quote'),
    chime = document.getElementById('chime'),
    testChimeHandle;

periodElmt.onchange = function (init) {
  var period;
  if (init !== true) {
    period = Math.max(0.1, +this.value);
    localStorage.setItem('period', period);
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
}

quoteElmt.oninput = function () {
  console.log(this.value.length, this.size);
  if (this.value.length == this.size) {
    this.size = this.value.length + 1;
  }
};

document.getElementById('test').onclick = function () {
  chrome.alarms.create('test', {
    when: Date.now()
  });
}

window.onbeforeunload = function () {
  localStorage.setItem('quote', quoteElmt.value); 
};

volumeElmt.onchange(true);
periodElmt.onchange(true);
notificationElmt.checked = localStorage.getItem('show notifications') == 'true';
quoteElmt.disabled = !notificationElmt.checked;
quoteElmt.value = localStorage.getItem('quote');
quoteElmt.size = quoteElmt.value.length + 1;