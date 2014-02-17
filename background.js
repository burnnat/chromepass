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