//@require core.js
//@require Chrome.Window

Ext.onReady(function() {
	Chrome.Window.remote = window.top;
	Chrome.Window.api({
		unload: function() {
			Ext.EventManager.fireUnload();
		}
	});
});