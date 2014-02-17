/**
 *
 */
Ext.define('Chrome.Window', function(Window) {
	Ext.ns('Chrome.Window');

	Window.prelisteners = Chrome.Window.prelisteners = Chrome.Window.prelisteners || [];

	return {
		extend: 'Ext.util.Observable',
		singleton: true,

		constructor: function() {
			this.callParent();

			var listener;
			var backlog = Window.prelisteners;

			while (listener = backlog.shift()) {
				this.addListener(
					listener.event,
					listener.fn,
					listener.scope,
					listener.options
				);
			}
		},

		close: function() {
			this.fireEvent('unload', this);
		}
	};
});