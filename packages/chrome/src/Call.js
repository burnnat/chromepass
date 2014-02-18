/**
 *
 */
Ext.define('Chrome.Call', {

	key: null,

	id: null,

	data: null,

	constructor: function(config) {
		Ext.apply(this, config);
	},

	respond: function(result) {
		Chrome.Window.send(
			new Chrome.Call({
				key: this.key,
				id: this.id,
				data: result
			})
		);
	},

	getMessage: function() {
		return {
			key: this.key,
			id: this.id,
			data: this.data
		};
	}
});
