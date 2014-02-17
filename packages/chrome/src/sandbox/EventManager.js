/**
 *
 */
Ext.define('Chrome.sandbox.EventManager', {
	override: 'Ext.EventManager',

	addRawListener: null,

	addSafeListener: function(element, eventName, fn, scope, options) {
		if (element === window && eventName === 'unload') {
			Ext.ns('Chrome.Window');

			var loaded = Ext.getClass('Chrome.Window') !== null;

			if (loaded) {
				Chrome.Window.on(eventName, fn, scope, options);
			}
			else {
				var backlog = Chrome.Window.prelisteners = Chrome.Window.prelisteners || [];

				backlog.push({
					event: eventName,
					fn: fn,
					scope: scope,
					options: options
				});
			}
		}
		else {
			this.addRawListener.apply(this, arguments);
		}
	}
}, function() {
	var original = Ext.EventManager.addListener;
	var addListener = Ext.EventManager.addSafeListener;

	Ext.override(
		Ext.EventManager,
		{
			addRawListener: original,
			addListener: addListener,
			on: addListener
		}
	);
});
