chrome.app.runtime.onLaunched.addListener(function(launchData) {
	chrome.app.window.create(
		'root/index.html',
		{
			width: 1000,
			height: 700
		},
		function (win) {
			var inner = win.contentWindow;

			win.launchData = launchData;

			win.onClosed.addListener(function() {
				inner.api.close();
			});
		}
	);
});

var EXTENSION_ID = 'nebajhfbjdffeoondgfjcaknnlhgkpjk';

/**
 * @param {String} action
 * @param {Object} data
 * @param {Function} [callback]
 */
window.notifyExternal = function(action, data, callback) {
	chrome.runtime.sendMessage(
		EXTENSION_ID,
		{
			action: action,
			data: data
		},
		{},
		callback
	);
};
