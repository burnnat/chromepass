//@require Chrome.Window

(function() {
	Chrome.Window.remote = window.top;
	Chrome.Window.api({
		unload: function() {
			Chrome.Window.fireEvent('unload', this);
		}
	});
})();