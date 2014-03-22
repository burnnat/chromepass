/**
 *
 */
Ext.define('Pass.controller.Main', {
	extend: 'Ext.app.Controller',

	uses: [
		'Ext.data.TreeStore',
		'Ext.window.MessageBox',

		'Chrome.util.Clipboard',

		'Pass.data.proxy.EncryptedFile',
		'Pass.data.reader.NestedXml',
		'Pass.model.Group',
		'Pass.view.KeyDialog'
	],

	refs: [
		{
			ref: 'tree',
			selector: 'treepanel'
		},
		{
			ref: 'grid',
			selector: 'gridpanel'
		},
		{
			ref: 'contextMenu',
			selector: 'menu#entryContext'
		}
	],

	/**
	 * @private
	 * @property {Pass.model.Entry}
	 */
	activeEntry: null,

	init: function() {
		this.control({
			'menuitem#openFile': {
				click: 'onOpenFile'
			},

			'menuitem#copyUsername': {
				click: 'onCopyUsername'
			},

			'menuitem#copyPassword': {
				click: 'onCopyPassword'
			},

			'treepanel': {
				select: 'onGroupSelect'
			},

			'gridpanel': {
				itemcontextmenu: 'onEntryContext'
			}
		});
	},

	onOpenFile: function() {
		Chrome.Window.chooseFile(
			{
				accepts: [
					{
						description: 'KeePass database files',
						extensions: ['kdbx']
					}
				]
			},
			function(call) {
				var dialog = new Pass.view.KeyDialog({
					callback: function(dialog, values) {
						this.loadFile(call.data, values.masterKey, values.keyFile);
					},
					scope: this
				});

				dialog.show();
			},
			this
		);
	},

	loadFile: function(data, password, keyFile) {
		var store = new Ext.data.TreeStore({
			model: 'Pass.model.Group',

			proxy: new Pass.data.proxy.EncryptedFile({
				buffer: data,
				password: password,
				keyFile: keyFile,

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
	},

	onGroupSelect: function(tree, group) {
		this.getGrid().reconfigure(group.entries());
	},

	onEntryContext: function(grid, record, item, index, e) {
		e.stopEvent();

		this.activeEntry = record;
		this.getContextMenu().showAt(e.xy);
	},

	onCopyUsername: function() {
		this.copyActive('username');
	},

	onCopyPassword: function() {
		this.copyActive('password');
	},

	copyActive: function(fieldName) {
		Chrome.Window.copyToClipboard(this.activeEntry.get(fieldName));
	}
});
