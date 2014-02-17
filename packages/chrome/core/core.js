//@require Ext.EventManager
//@require Chrome.Window

(function() {
	var original = Ext.EventManager.addListener;

	var addListener = function(element, eventName) {
		if (element === window && eventName === 'unload') {
			Chrome.Window.on(eventName, fn, scope, options);
		}
		else {
			original.apply(this, arguments);
		}
	};

	Ext.override(
		Ext.EventManager,
		{
			addListener: addListener,
			on: addListener
		}
	);
})();
