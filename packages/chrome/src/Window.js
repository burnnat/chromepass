/**
 * Server:
 *
 *     Chrome.Window.api(
 *         window.top,
 *         {
 *             add: function(call) {
 *                 call.respond(call.data.first + call.data.second);
 *             }
 *         }
 *     );
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
Ext.define('Chrome.Window', function(Window) {
	Ext.ns('Chrome.Window');

	Window.prelisteners = Chrome.Window.prelisteners = Chrome.Window.prelisteners || [];

	return {
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

			this.callbacks = new Ext.util.HashMap();

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
		},

		remoteApi: function(methods) {
			Ext.Object.each(
				methods,
				function(name, fn) {
					this[name] = Ext.Function.pass(
						this.handleRemote,
						[name]
					);
				},
				this
			);
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
		},

		unload: function() {
			this.fireEvent('unload', this);
		}
	};
});