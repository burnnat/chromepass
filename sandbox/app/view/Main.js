/**
 *
 */
Ext.define('Pass.view.Main', {
	extend: 'Ext.container.Container',

	requires:[
		'Ext.data.Store',
		'Ext.data.TreeStore',
		'Ext.grid.Panel',
		'Ext.tree.Panel',
		'Ext.toolbar.Toolbar',
		'Ext.layout.container.Border'
	],

	layout: 'border',

	initComponent: function() {
		this.items = [
			new Ext.toolbar.Toolbar({
				region: 'north',

				items: [
					{
						text: 'Open',
						menu: [
							{
								itemId: 'openFile',
								text: 'File...'
							},
							{
								itemId: 'openUrl',
								text: 'URL...'
							}
						]
					}
				]
			}),
			new Ext.tree.Panel({
				title: 'Categories',
				region: 'west',
				width: 150,
				rootVisible: false
			}),
			new Ext.grid.Panel({
				title: 'Accounts',
				region: 'center',

				columns: [
					{
						text: 'Title',
						dataIndex: 'title',
						flex: 1
					},
					{
						text: 'Username',
						dataIndex: 'username',
						flex: 1
					},
					{
						text: 'Password',
						dataIndex: 'password',
						renderer: function() {
							return Ext.String.repeat('*', 8);
						},
						flex: 1
					},
					{
						text: 'URL',
						dataIndex: 'url',
						flex: 1
					},
					{
						text: 'Notes',
						dataIndex: 'notes',
						flex: 1
					}
				]
			})
		];

		this.gridMenu = new Ext.menu.Menu({
			itemId: 'entryContext',

			items: [
				{
					itemId: 'copyUsername',
					text: 'Copy username'
				},
				{
					itemId: 'copyPassword',
					text: 'Copy password'
				},
				{
					itemId: 'openEntryUrl',
					text: 'Open URL',
					disabled: true
				},
				{
					itemId: 'autoType',
					text: 'Auto-Type in Chrome',
					disabled: true
				}
			]
		});

		this.callParent();
	}
});