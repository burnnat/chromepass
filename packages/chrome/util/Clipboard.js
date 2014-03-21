/**
 * Provides access for writing to the system clipboard.
 * Requires the `clipboardWrite` permission to function.
 */
Ext.define('Chrome.util.Clipboard', {
	singleton: true,

	copy: function(data) {
		var el = document.createElement('textarea');

		document.body.appendChild(el);

		el.innerText = data;
		el.select();

		document.execCommand('copy');
		document.body.removeChild(el);
	}
});
