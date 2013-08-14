var chime = document.getElementById('chime'),
    volume;

function clamp(x, lower, upper) {
	return Math.max(lower, Math.min(x, upper));
}

chrome.runtime.onInstalled.addListener(function () {
	console.log('installed');
	localStorage.setItem('period', localStorage.getItem('period') || 5);
	localStorage.setItem('volume', localStorage.getItem('volume') || 0.5);
});

chrome.runtime.onStartup.addListener(function () {
	console.log('started');

	chrome.alarms.create('pace', {
		periodInMinutes: Math.max(0.1, +localStorage.getItem('period')),
	});
});


chrome.alarms.onAlarm.addListener(function (alarm) {
	console.log('alarm');
	chime = chime || document.getElementById('chime');
	volume = clamp(+localStorage.getItem('volume'), 0, 1);
	if (volume > 0) {
		chime.volume = volume;
		chime.play();
	}
});
