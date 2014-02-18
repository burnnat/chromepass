//@require core.js
//@require Chrome.Window

Ext.USE_NATIVE_JSON = true;

window.api = {
	close: function() {
		Ext.EventManager.fireUnload();
	}
};

Ext.onReady(function() {
	var frame = document.querySelector('iframe[sandbox]:not([sandbox=""])');

	if (frame) {
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

	Chrome.Window.remoteApi({
		unload: true
	});

	Ext.EventManager.onWindowUnload(function() {
		// pass unload event to sandbox frame
		Chrome.Window.unload();
	});
});