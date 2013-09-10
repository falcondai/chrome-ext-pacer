var chime = document.getElementById('chime'),
    volume;

function clamp(x, lower, upper) {
	return Math.max(lower, Math.min(x, upper));
}

function playAlarm() {
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
}

chrome.runtime.onInstalled.addListener(function (details) {
	console.log('installed:', details);

	localStorage.setItem('period', localStorage.getItem('period') || 10);
	chrome.storage.local.get(['color', 'holo', 'useTick'], function(items) {
		chrome.storage.local.set({
			period: +localStorage.getItem('period') || 10,
			color: items.color || 'blue',
			holo: items.holo || localStorage.getItem('holo') || 'hide',
			useTick: items.useTick || true,
		});
	});
	
	localStorage.setItem('volume', localStorage.getItem('volume') || 0.5);
	localStorage.setItem('show notifications', localStorage.getItem('show notifications') || 'false');
	localStorage.setItem('quote', localStorage.getItem('quote') || '');

	chrome.permissions.contains({
		permissions: ['tabs'],
		origins: ['https://*/*', 'http://*/*']
	}, function(result) {
		if (result) {
			localStorage.setItem('holo', localStorage.getItem('holo') || 'hide');
		} else {
			localStorage.setItem('holo', 'hide');
		}
	});

	if (details.reason == 'install') {
		chrome.tabs.create({
			url: chrome.extension.getURL('/options.html')
		});
	} else if (details.reason == 'update') {
		var notification = webkitNotifications.createNotification(
			'/assets/image/logo.png', 
			'Pacer is updated',
			'click to visit options page'
		);
		notification.onclick = function () {
			chrome.tabs.create({
				url: chrome.extension.getURL('/options.html')
			});
			this.cancel();
		}
		notification.show();
		setTimeout(function () {
			notification.cancel();
		}, 5000);
	}

	chrome.alarms.create('pace', {
    periodInMinutes: +localStorage.getItem('period')
  });
  chrome.storage.local.set({
		lastAlarm: Date.now(),
	});
});

chrome.runtime.onStartup.addListener(function () {
	console.log('started');

	chrome.alarms.create('pace', {
		periodInMinutes: +localStorage.getItem('period'),
	});
	chrome.storage.local.set({
		lastAlarm: Date.now(),
	});
});


chrome.alarms.onAlarm.addListener(function() {
	chrome.storage.local.set({
		lastAlarm: Date.now(),
	});
	playAlarm();
});

chrome.runtime.onMessage.addListener(playAlarm);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	// console.log(changeInfo, tab.url);
	if (localStorage.getItem('holo') != 'hide') {
		if (changeInfo.status == 'complete' && tab.url.substring(0, 4) == 'http') {
			console.log('injected to', tab);
			chrome.tabs.executeScript(null, {
				file: '/holo.js'
			});
			chrome.tabs.executeScript(null, {
				file: '/inject.js'
			});
		}
	}
});