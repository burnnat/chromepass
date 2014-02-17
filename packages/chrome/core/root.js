//@require Chrome.Window

Ext.USE_NATIVE_JSON = true;

Ext.onReady(function() {
	window.api = Chrome.Window;

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
});