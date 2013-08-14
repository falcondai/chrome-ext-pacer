function clamp(x, lower, upper) {
  return Math.max(lower, Math.min(x, upper));
}

var periodElmt = document.getElementById('period'),
    volumeElmt = document.getElementById('volume'),
    perIndicator = document.getElementById('period-indicator');
    volIndicator = document.getElementById('volume-indicator');

periodElmt.onchange = function () {
  var period = Math.max(0.1, +this.value == NaN ? localStorage.getItem('period') : +this.value);
  localStorage.setItem('period', period);
  chrome.alarms.clearAll();
  chrome.alarms.create('pace', {
    periodInMinutes: period
  });
  perIndicator.textContent = period + ' minutes';
};

volumeElmt.onchange = function () {
  var volume = clamp(+this.value, 0, 1);
  localStorage.setItem('volume', volume);
  volIndicator.textContent = Math.ceil(volume * 100) + '%'
};

periodElmt.value = +localStorage.getItem('period');
volumeElmt.value = +localStorage.getItem('volume');