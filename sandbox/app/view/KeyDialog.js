/**
 *
 */
Ext.define('Pass.view.KeyDialog', {
	extend: 'Ext.window.Window',

	uses: [
		'Ext.form.Panel',
		'Ext.form.field.Text',
		'Ext.form.field.File',

		'Chrome.util.File',

		'Pass.form.FieldSelector'
	],

	title: 'Enter Master Key',
	layout: 'fit',
	width: 400,

	modal: true,
	closable: false,

	defaultFocus: 'password',

	initComponent: function() {
		this.items = [
			{
				xtype: 'form',
				margin: 5,

				fieldDefaults: {
					labelWidth: 75,
					anchor: '100%'
				},

				items: [
					{
						xtype: 'fieldselector',
						fieldLabel: 'Master Key',

						field: {
							xtype: 'textfield',
							itemId: 'password',
							inputType: 'password',
							name: 'masterKey',
							listeners: {
								specialkey: this.onSpecialKey,
								scope: this
							}
						}
					},
					{
						xtype: 'fieldselector',
						fieldLabel: 'Key File',

						field: {
							xtype: 'filefield',
							itemId: 'keyFile',
							name: 'keyFile'
						}
					}
				]
			}
		];

		this.buttons = [
			{
				text: 'Ok',
				handler: this.onOkay,
				scope: this
			},
			{
				text: 'Cancel',
				handler: this.onCancel,
				scope: this
			}
		];

		this.callParent(arguments);
	},

	onOkay: function() {
		var values = {};

		// Get values prior to closing the window as the fields will be destroyed
		Ext.Array.forEach(
			this.query('fieldselector'),
			function(selector) {
				if (selector.isSelected()) {
					values[selector.field.name] = selector.getValue();
				}
			}
		);

		this.close();

		if (values.keyFile) {
			// Key file input is enabled, read the actual value of the file
			Chrome.util.File.readAsBuffer(
				values.keyFile,
				{
					callback: function(success, buffer) {
						values.keyFile = buffer;
						Ext.callback(this.callback, this.scope, [this, values]);
					},
					scope: this
				}
			);
		}
		else {
			// No key file, proceed straight to callback
			Ext.callback(this.callback, this.scope, [this, values]);
		}
	},

	onCancel: function() {
		this.close();
	},

	onSpecialKey: function(field, e) {
		if (e.getKey() == e.ENTER) {
			this.onOkay();
		}
	}
});
