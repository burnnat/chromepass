/**
 *
 */
Ext.define('Pass.view.KeyDialog', {
	extend: 'Ext.window.Window',

	uses: [
		'Ext.form.Panel',
		'Ext.form.field.Text',
		'Ext.form.field.File',
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
		// Get values prior to closing the window as the fields will be destroyed
		var values = this.child('form').getValues();

		this.close();

		Ext.callback(this.callback, this.scope, [this, values]);
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
