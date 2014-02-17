//@require Chrome.Window

(function() {
	Ext.EventManager.addListener(
		window,
		'message',
		function(e) {
			var raw = e.browserEvent || e;
			var data = raw.data;

			if (data && data.key === 'unload') {
				Chrome.Window.close();
			}
		}
	);
})();