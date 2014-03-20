/**
 *
 */
Ext.define('Pass.controller.Main', {
	extend: 'Ext.app.Controller',

	uses: [
		'Ext.data.TreeStore',
		'Ext.window.MessageBox',
		'Pass.data.proxy.EncryptedFile',
		'Pass.data.reader.NestedXml'
	],

	refs: [
		{
			ref: 'tree',
			selector: 'treepanel'
		},
		{
			ref: 'grid',
			selector: 'grid'
		}
	],

	init: function() {
		this.control({
			'menuitem[text="File..."]': {
				click: 'onOpenFile'
			}
		});
	},

	onOpenFile: function() {
		Chrome.Window.chooseFile(
			null,
			function(call) {
				Ext.MessageBox.show({
					title: 'Enter Password',
					msg: 'Please enter your password:',

					prompt: true,
					closable: false,
					buttons: Ext.MessageBox.OKCANCEL,

					fn: function(buttonId, text) {
						if (buttonId === 'ok') {
							this.loadFile(call.data, text);
						}
					},
					scope: this
				});
			},
			this
		);
	},

	loadFile: function(data, password) {
		var store = new Ext.data.TreeStore({
			fields:[
				{
					name: 'text',
					mapping: 'Name'
				},
				{
					name: 'expanded',
					mapping: 'IsExpanded'
				}
			],

			proxy: new Pass.data.proxy.EncryptedFile({
				buffer: data,
				password: password,

				reader: new Pass.data.reader.NestedXml({
					type: 'xml',
					top: 'KeePassFile',
					topRoot: 'Root',
					root: 'Group',
					record: '>Group'
				})
			})
		});

		this.getTree().reconfigure(store);

		store.load();
	}
});
