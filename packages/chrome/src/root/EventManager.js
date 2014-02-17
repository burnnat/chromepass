/**
 *
 */
Ext.define('Chrome.root.EventManager', {
	singleton: true,
	requires: ['Ext.util.Event'],

	constructor: function() {
		this.readyEvent = new Ext.util.Event();
		this.idleEvent = new Ext.util.Event();
	}
}, function() {
	if (!Ext.EventManager) {
		Ext.EventManager = Chrome.root.EventManager;
	}
});
