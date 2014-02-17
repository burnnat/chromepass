/**
 *
 */
Ext.define('Pass.controller.Main', {
	extend: 'Ext.app.Controller',

	uses: [
		'Chrome.PostMessage'
	],

	init: function() {
		this.control({
			'menuitem[text="File..."]': {
				click: 'onOpenFile'
			}
		});
	},

	onOpenFile: function() {
		console.log('Open file');
	}
});
