//@require core.js
//@require Chrome.Window

//@tag chrome-sandbox

Ext.onReady(function() {
	Chrome.Window.remote = window.top;
	Chrome.Window.api({
		unload: function() {
			Ext.EventManager.fireUnload();
		}
	});
});