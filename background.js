var chime = document.getElementById('chime'),
    volume;

function clamp(x, lower, upper) {
	return Math.max(lower, Math.min(x, upper));
}

chrome.runtime.onInstalled.addListener(function () {
	console.log('installed');
	localStorage.setItem('period', localStorage.getItem('period') || 10);
	localStorage.setItem('volume', localStorage.getItem('volume') || 0.5);
	localStorage.setItem('show notifications', localStorage.getItem('show notifications') || false);
	localStorage.setItem('quote', localStorage.getItem('quote') || '');

	chrome.tabs.create({
		url: chrome.extension.getURL('/options.html')
	});
});

chrome.runtime.onStartup.addListener(function () {
	console.log('started');

	chrome.alarms.create('pace', {
		periodInMinutes: +localStorage.getItem('period'),
	});
});


chrome.alarms.onAlarm.addListener(function (alarm) {
	console.log('nudge');
	chime = chime || document.getElementById('chime');
	volume = clamp(+localStorage.getItem('volume'), 0, 1);
	if (volume > 0) {
		chime.volume = volume;
		chime.play();
	}
	if (localStorage.getItem('show notifications') == 'true') {
		var notification = webkitNotifications.createNotification(
			'/assets/image/logo.png', 
			localStorage.getItem('period') + ' minutes has passed',
			localStorage.getItem('quote')
		);
		notification.onclick = function () {
			this.cancel();
		}
		notification.show();
		setTimeout(function () {
			notification.cancel();
		}, 3000);
	}
});
