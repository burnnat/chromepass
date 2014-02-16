window.api = {};

(function() {
	var sandbox;

	window.addEventListener(
		'DOMContentLoaded',
		function() {
			sandbox = document.getElementById('sandbox-frame').contentWindow;
		},
		false
	);

	api.close = function() {
		sandbox.postMessage(
			{ key: 'unload' },
			'*'
		);
	};
})();
