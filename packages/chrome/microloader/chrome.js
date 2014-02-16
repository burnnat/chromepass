(function() {
	var original = Ext.EventManager.addListener;

	var addListener = function(element, eventName, fn, scope, options) {
		if (element === window && eventName === 'unload') {
			original.call(
				this,
				element,
				'message',
				function(e) {
					var raw = e.browserEvent || e;
					var data = raw.data;

					if (data && data.key === 'unload') {
						fn.apply(this, arguments);
					}
				},
				scope,
				options
			);
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
