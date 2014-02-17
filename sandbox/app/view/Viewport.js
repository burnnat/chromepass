/**
 *
 */
Ext.define('Pass.view.Viewport', {
	extend: 'Ext.container.Viewport',

	requires:[
		'Ext.layout.container.Fit',
		'Pass.view.Main'
	],

	layout: 'fit',

	initComponent: function() {
		this.items = new Pass.view.Main();
		this.callParent();
	}
});
