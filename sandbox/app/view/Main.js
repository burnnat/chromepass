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
								text: 'File...'
							},
							{
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
					{ text: 'Title', dataIndex: 'title' },
					{ text: 'Username', dataIndex: 'username' },
					{ text: 'Password', dataIndex: 'password' },
					{ text: 'URL', dataIndex: 'url' }
				],

				store: new Ext.data.Store({
					fields:[
						'title',
						'username',
						'password',
						'url'
					],

					data: [
						{
							title: 'Sample #1',
							username: 'joebob',
							password: 'temp1234',
							url: 'http://www.google.com'
						},
						{
							title: 'Sample #2',
							username: 'admin',
							password: 'tM4o.9/$',
							url: 'https://github.com'
						}
					],

					proxy: 'memory'
				})
			})
		];

		this.callParent();
	}
});