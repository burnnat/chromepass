/**
 *
 */
Ext.define('Chrome.util.File', {
	singleton: true,

	/**
	 *
	 * @param {File} file
	 * @param {Object} options
	 *
	 * @param {Function} options.success
	 * @param {ArrayBuffer} options.success.buffer
	 *
	 * @param {Function} options.failure
	 *
	 * @param {Function} options.callback
	 * @param {boolean} options.callback.success
	 * @param {ArrayBuffer} options.callback.buffer
	 */
	readAsBuffer: function(file, options) {
		var reader = new FileReader();

		reader.onerror = function() {
			Ext.callback(options.failure, options.scope);
			Ext.callback(options.callback, options.scope, [false, null]);
		};

		reader.onloadend = function(e) {
			var buffer = e.target.result;
			Ext.callback(options.success, options.scope, [buffer]);
			Ext.callback(options.callback, options.scope, [true, buffer]);
		};

		reader.readAsArrayBuffer(file);
	}
});
