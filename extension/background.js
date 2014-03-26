chrome.runtime.onMessageExternal.addListener(
	function(request, sender, sendResponse) {
		console.log('Extension received message');
		console.log(request);

		switch (request.action) {
			case 'open':
				chrome.tabs.create({
					url: request.data.url
				});

				return;
		}
	}
);
