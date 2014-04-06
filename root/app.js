Ext.require([
	'Ext.Ajax',
	'Chrome.util.Clipboard',
	'Chrome.util.File'
]);

Chrome.onSandboxReady(function() {
	Chrome.Window.api({
		openUrl: function(call) {
			Ext.Ajax.request({
				url: call.data,
				binary: true,

				callback: function(options, success, response) {
					call.respond({
						success: success,
						response: response.responseBytes
					});
				}
			});
		},

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
						data.data,
						function(response) {
							call.respond(response);
						}
					);
				}
			);
		}
	});
});
