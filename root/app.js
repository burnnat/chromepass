Ext.require([
	'Chrome.util.Clipboard'
]);

Chrome.onSandboxReady(function() {
	Chrome.Window.api({
		chooseFile: function(call) {
			chrome.fileSystem.chooseEntry(
				{ type: 'openFile' },
				function(entry) {
					entry.file(function(file) {
						var reader = new FileReader();

						reader.onerror = function() {
							call.respond(null);
						};

						reader.onloadend = function(e) {
							call.respond(e.target.result);
						};

						reader.readAsArrayBuffer(file);
					});
				}
			);
		},

		copyToClipboard: function(call) {
			Chrome.Clipboard.copy(call.data);
		}
	});
});
