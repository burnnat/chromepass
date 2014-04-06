/**
 * Server:
 *
 *     Chrome.Window.api({
 *         add: function(call) {
 *             call.respond(call.data.first + call.data.second);
 *         }
 *     });
 *
 * Client:
 *
 *     Chrome.Window.add(
 *         {
 *             first: 32,
 *             second: 10
 *         },
 *         function(call) {
 *             console.log(call.data);
 *         }
 *     );
 */
Ext.define('Chrome.Window', {
	extend: 'Ext.util.Observable',

	singleton: true,

	requires: [
		'Ext.EventManager',
		'Ext.util.HashMap'
	],

	/**
	 * @cfg {Window} The remote window with which to communicate.
	 */
	remote: null,

	/**
	 * @private
	 * @property {Ext.util.HashMap}
	 */
	callbacks: null,

	constructor: function() {
		this.callParent(arguments);

		this.callbacks = new Ext.util.HashMap();
		this.addEvents('remoteapi');

		window.addEventListener(
			'message',
			function(e) {
				var raw = e.browserEvent || e;
				var data = raw.data;

				if (data) {
					Chrome.Window.receive(
						new Chrome.Call(data)
					);
				}
			}
		);
	},

	api: function(methods) {
		Ext.apply(this, methods);

		this.send(
			new Chrome.Call({
				key: 'remoteapi',
				data: Ext.Object.getKeys(methods)
			})
		);
	},

	remoteapi: function(call) {
		var methods = call.data;

		Ext.Array.forEach(
			methods,
			function(name) {
				this[name] = Ext.Function.pass(
					this.handleRemote,
					[name]
				);

				console.log('Registered remote API: ' + name);
			},
			this
		);

		this.fireEvent('remoteapi', Ext.Object.getKeys(methods));
	},

	handleRemote: function(name, data, callback, scope) {
		var call, id;

		if (data instanceof Chrome.Call) {
			// This is a response coming back, check for a listener.
			call = data;
			id = call.id;

			var waiting = this.callbacks.get(id);

			if (waiting) {
				Ext.callback(waiting.fn, waiting.scope, [call]);
			}
		}
		else {
			// We're initiating a remote call.
			call = new Chrome.Call({
				key: name,
				data: data
			});

			id = Ext.id(call);

			if (callback) {
				this.callbacks.add(
					id,
					{
						fn: callback,
						scope: scope
					}
				);
			}

			this.send(call);
		}
	},

	receive: function(call) {
		var key = call.key;

		if (Ext.isFunction(this[key])) {
			this[key](call);
		}
		//<debug warn>
		else {
			Ext.log({
				level: 'warn',
				msg: 'Received message for API "' + key + '" but no such method exists'
			});
		}
		//</debug>
	},

	send: function(call) {
		this.remote.postMessage(
			call.getMessage(),
			'*'
		);
	}
});