function clamp(x, lower, upper) {
  return Math.max(lower, Math.min(x, upper));
}

var periodElmt = document.getElementById('period'),
    volumeElmt = document.getElementById('volume'),
    perIndicator = document.getElementById('period-indicator'),
    volIndicator = document.getElementById('volume-indicator'),
    notificationElmt = document.getElementById('notification');

periodElmt.onchange = function () {
  var period = Math.max(0.1, +this.value);
  localStorage.setItem('period', period);
  chrome.alarms.create('pace', {
    periodInMinutes: period
  });
  perIndicator.textContent = period + ' minutes';
};

volumeElmt.onchange = function () {
  var volume = clamp(+this.value, 0, 1);
  localStorage.setItem('volume', volume);
  if (volume > 0) {
    volIndicator.textContent = Math.ceil(volume * 100) + '%';
  } else {
    volIndicator.textContent = 'muted';
  }
};

notificationElmt.onchange = function () {
  localStorage.setItem('show notifications', this.checked);
};

volumeElmt.onchange();
periodElmt.onchange();
notificationElmt.checked = localStorage.getItem('show notifications') == 'true';