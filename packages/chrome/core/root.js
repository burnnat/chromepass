//@require Chrome.Window

Ext.onReady(function() {
	window.api = Chrome.Window;

	Chrome.Window.on(
		'unload',
		function() {
			var frame = document.querySelector('iframe[sandbox]:not([sandbox=""])');

			if (frame) {
				var sandbox = frame.contentWindow;

				sandbox.postMessage(
					{ key: 'unload' },
					'*'
				);
			}
		}
	);
});