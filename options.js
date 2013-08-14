function clamp(x, lower, upper) {
  return Math.max(lower, Math.min(x, upper));
}

var periodElmt = document.getElementById('period'),
    volumeElmt = document.getElementById('volume'),
    indicatorElmt = document.getElementById('volume-indicator');

periodElmt.onchange = function () {
  chrome.alarms.clearAll();
  var period = Math.max(0.1, +this.value == NaN ? localStorage.getItem('period') : +this.value);
  localStorage.setItem('period', period);
  chrome.alarms.create('pace', {
    periodInMinutes: period
  });
  this.value = period;
};

volumeElmt.onchange = function () {
  var volume = clamp(+this.value, 0, 1);
  localStorage.setItem('volume', volume);
  indicatorElmt.textContent = Math.ceil(volume * 100) + '%'
};

periodElmt.value = +localStorage.getItem('period');
volumeElmt.value = +localStorage.getItem('volume');