//@require Ext.EventManager
//@require Chrome.root.EventManager

//@tag chrome-core

(function() {
	/*
	 * Don't actually attach any unload event listeners to the window (this is
	 * disallowed by Chrome). Unload listeners will still be added to the
	 * EventManager's internal unloadEvent; we can fire these manually when we
	 * receive notification the parent window is closing.
	 */

	var override = Ext.Function.createInterceptor(
		Ext.EventManager.addListener,
		function(element, eventName) {
			return element !== window || eventName !== 'unload';
		}
	);

	Ext.override(
		Ext.EventManager,
		{
			addListener: override,
			on: override
		}
	);
})();
