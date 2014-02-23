//@tag chrome-core
/**
 *
 */
Ext.define('Chrome.root.EventManager', {
	singleton: true,

	requires: [
		'Ext.util.Event'
	],

	constructor: function() {
		this.readyEvent = new Ext.util.Event();
		this.idleEvent = new Ext.util.Event();
		this.unloadEvent = new Ext.util.Event();
		this.sandboxEvent = new Ext.util.Event();
	},

	onWindowUnload: function(fn, scope, options) {
		this.unloadEvent.addListener(fn, scope, options);
	},

	fireUnload: function() {
		this.unloadEvent.fire();
	},

	onDocumentReady: function(fn, scope, options) {
		options = options || {};
		options.single = true;

		this.readyEvent.addListener(fn, scope, options);

		if (!this.isFiring) {
			if (Ext.isReady) {
				this.fireReadyEvent();
			} else {
				this.bindReadyEvent();
			}
		}
	},

	bindReadyEvent: function() {
		if (this.hasBoundOnReady) {
			return;
		}

		document.addEventListener('DOMContentLoaded', this.onReadyEvent);

		this.hasBoundOnReady = true;
	},

	onReadyEvent: function(e) {
		// Note: this is called in the scope of the document!
		var me = Chrome.root.EventManager;

		if (me.hasBoundOnReady) {
			document.removeEventListener('DOMContentLoaded', me.onReadyEvent);
		}

		if (!Ext.isReady) {
			Ext.isReady = true;
			Ext.supports.init();
			me.fireReadyEvent();
		}
	},

	fireReadyEvent: function() {
		var readyEvent = this.readyEvent;

		this.isFiring = true;

		// Ready events are all single: true, if we get to the end
		// & there are more listeners, it means they were added
		// inside some other ready event
		while (readyEvent.listeners.length) {
			readyEvent.fire();
		}

		this.isFiring = false;
		this.idleEvent.fire();
	},

	onSandboxReady: function(fn, scope, options) {
		this.sandboxEvent.addListener(fn, scope, options);
	},

	bindSandbox: function(sandbox) {
		if (this.hasBoundOnSandbox) {
			return;
		}

		this.sandbox = sandbox;

		sandbox.addEventListener('load', this.onSandboxLoad);

		this.hasBoundOnSandbox = true;
	},

	onSandboxLoad: function() {
		// Note: this is called in the scope of the sandbox!
		var me = Chrome.root.EventManager;

		if (me.hasBoundOnSandbox) {
			me.sandbox.removeEventListener('load', me.onSandboxLoad);
		}

		me.fireSandboxLoad();
	},

	fireSandboxLoad: function() {
		this.sandboxEvent.fire();
	}
}, function() {
	if (!Ext.EventManager) {
		var manager = Chrome.root.EventManager;

		Ext.EventManager = manager;
		Ext.onDocumentReady = Ext.bind(manager.onDocumentReady, manager);
	}
});
