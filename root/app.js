Chrome.onSandboxReady(function() {
	Chrome.Window.api({
		add: function(call) {
			var data = call.data;
			call.respond(data.first + data.second);
		}
	});
});
