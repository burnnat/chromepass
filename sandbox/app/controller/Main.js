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
			ref: 'viewport',
			selector: 'viewport'
		},
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

	externalEnabled: false,

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

			'menuitem#openUrl': {
				click: 'onOpenUrl'
			},

			'menuitem#openEntryUrl': {
				click: 'onOpenEntryUrl'
			},

			'menuitem#copyUsername': {
				click: 'onCopyUsername'
			},

			'menuitem#copyPassword': {
				click: 'onCopyPassword'
			},

			'menuitem#autoType': {
				click: 'onAutoType'
			},

			'treepanel': {
				select: 'onGroupSelect'
			},

			'gridpanel': {
				itemcontextmenu: 'onEntryContext'
			}
		});

		Chrome.Window.on(
			'remoteapi',
			function() {
				Chrome.Window.notifyExternal(
					{
						action: 'register'
					},
					function(call) {
						var response = call.data;

						if (response && response.success) {
							console.log('Detected external extension');
							this.setExternalEnabled(true);
						}
					},
					this
				);
			},
			this,
			{
				single: true
			}
		);
	},

	setExternalEnabled: function(enabled) {
		this.externalEnabled = enabled;

		var menu = this.getContextMenu();

		menu.down('#autoType').setDisabled(!enabled);
		menu.down('#openEntryUrl').setDisabled(!enabled);
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
				this.openDatabase(call.data);
			},
			this
		);
	},

	onOpenUrl: function() {
		Ext.MessageBox.prompt(
			'Open URL',
			'Enter the URL to open:',
			function(button, url) {
				if (button !== 'ok') {
					return;
				}

				Chrome.Window.openUrl(
					url,
					function(call) {
						var data = call.data;

						if (data.success) {
							this.openDatabase(data.response);
						}
					},
					this
				);
			},
			this
		);
	},

	openDatabase: function(data) {
		var dialog = new Pass.view.KeyDialog({
			callback: function(dialog, values) {
				this.loadFile(data, values.masterKey, values.keyFile);
			},
			scope: this
		});

		dialog.show();
	},

	loadFile: function(data, password, keyFile) {
		this.getViewport().setLoading('Loading...');

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
		this.getGrid().reconfigure(Ext.getStore('ext-empty-store'));

		store.load({
			callback: function(records, operation, success) {
				this.getViewport().setLoading(false);

				if (!success) {
					Ext.MessageBox.alert(
						'Error',
						'Unable to open the database file. Please double-check the password and try again.'
					);
				}
			},
			scope: this
		});
	},

	onGroupSelect: function(tree, group) {
		this.getGrid().reconfigure(group.entries());
	},

	onEntryContext: function(grid, entry, item, index, e) {
		e.stopEvent();

		var menu = this.getContextMenu();
		this.activeEntry = entry;

		menu.down('#autoType').setDisabled(!this.externalEnabled || !entry.get('autoTypeEnabled'));
		menu.showAt(e.xy);
	},

	onOpenEntryUrl: function() {
		Chrome.Window.notifyExternal({
			action: 'open',
			data: {
				url: this.activeEntry.get('url')
			}
		});
	},

	onAutoType: function() {
		var entry = this.activeEntry;

		if (!entry.get('autoTypeEnabled')) {
			return;
		}

		var text = entry.get('autoTypeSequence') || '{USERNAME}{TAB}{PASSWORD}{ENTER}';

		text = text.replace(
			/\{(.*?)\}/g,
			function(match, key) {
				switch (key.toLowerCase()) {
					case 'username':
						return entry.get('username');
					case 'password':
						return entry.get('password');
					case 'tab':
						return '\t';
					case 'enter':
						return '\n';
				}
			}
		);

		Chrome.Window.notifyExternal({
			action: 'autotype',
			data: {
				text: text
			}
		});
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
