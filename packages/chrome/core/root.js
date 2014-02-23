//@require core.js
//@require Chrome.Window

//@tag chrome-root

(function() {
	Ext.USE_NATIVE_JSON = true;

	window.api = {
		close: function() {
			Ext.EventManager.fireUnload();
		}
	};

	var manager = Chrome.root.EventManager;

	Chrome.onSandboxReady = Ext.bind(manager.onSandboxReady, manager);

	Ext.onReady(function() {
		var frame = document.querySelector('iframe[sandbox]:not([sandbox=""])');

		if (frame) {
			manager.bindSandbox(frame);
			Chrome.Window.remote = frame.contentWindow;
		}
		//<debug warn>
		else {
			Ext.log({
				level: 'warn',
				msg: 'Unable to locate sandboxed frame on the current page.'
			});
		}
		//</debug>

		Ext.EventManager.onWindowUnload(function() {
			// pass unload event to sandbox frame
			Chrome.Window.unload();
		});
	});
})();