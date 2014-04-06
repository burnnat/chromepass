var api = {
	register: function(data, callback) {
		callback({ success: true });
	},

	open: function(data, callback) {
		chrome.windows.getLastFocused(function(win) {
			chrome.tabs.create(
				{
					windowId: win.id,
					url: data.url,
					active: true
				},
				function() {
					chrome.windows.update(
						win.id,
						{
							focused: true
						},
						function() {
							callback({ success: true });
						}
					);
				}
			);
		});
	},

	autotype: function(data, callback) {
		chrome.windows.getLastFocused(function(win) {
			chrome.windows.update(
				win.id,
				{
					focused: true
				}
			);

			chrome.tabs.query(
				{
					windowId: win.id,
					active: true
				},
				function(tabs) {
					var tab = tabs[0];

					chrome.tabs.executeScript(
						tab.id,
						{
							file: 'autotype.js'
						},
						function() {
							chrome.tabs.executeScript(
								tab.id,
								{
									code: 'autotype(' + JSON.stringify(data) + ');'
								},
								function() {
									callback({ success: true });
								}
							);
						}
					);
				}
			);
		});
	}
};

chrome.runtime.onMessageExternal.addListener(
	function(request, sender, sendResponse) {
		var fn = api[request.action];

		if (!fn) {
			sendResponse({ success: false });
		}
		else {
			fn(request.data, sendResponse);
		}
	}
);
