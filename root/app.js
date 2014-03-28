Ext.require([
	'Chrome.util.Clipboard',
	'Chrome.util.File'
]);

Chrome.onSandboxReady(function() {
	Chrome.Window.api({
		chooseFile: function(call) {
			chrome.fileSystem.chooseEntry(
				Ext.apply(
					call.data || {},
					{
						type: 'openFile'
					}
				),
				function(entry) {
					entry.file(function(file) {
						Chrome.util.File.readAsBuffer(
							file,
							{
								callback: function(success, buffer) {
									call.respond(buffer);
								}
							}
						);
					});
				}
			);
		},

		copyToClipboard: function(call) {
			Chrome.util.Clipboard.copy(call.data);
		},

		notifyExternal: function(call) {
			var data = call.data;

			chrome.runtime.getBackgroundPage(
				function(page) {
					page.notifyExternal(
						data.action,
						data.data
					);
				}
			);
		}
	});
});
