/**
 * A field wrapper that adds a checkbox to select and/or clear the field.
 */
Ext.define('Pass.form.FieldSelector', {
	extend: 'Ext.form.FieldContainer',
	alias: 'widget.fieldselector',

	uses: [
		'Ext.form.field.Checkbox'
	],

	/**
	 * @cfg
	 */
	field: null,

	layout: 'hbox',

	initComponent: function() {
		this.checkbox = new Ext.form.field.Checkbox({
			submitValue: false,

			margin: {
				right: 5
			},

			listeners: {
				change: this.onCheckChange,
				scope: this
			}
		});

		this.items = [this.checkbox];

		this.callParent(arguments);

		this.field = this.add(
			Ext.apply(
				this.field,
				{ flex: 1 }
			)
		);

		this.mon(
			this.field,
			'change',
			this.onFieldChange,
			this
		);
	},

	isSelected: function() {
		return this.checkbox.getValue();
	},

	getValue: function() {
		var field = this.field;

		if (field.isFileUpload()) {
			return field.fileInputEl.dom.files[0];
		}
		else {
			return field.getValue();
		}
	},

	onCheckChange: function(checkbox, value) {
		if (value === false) {
			this.field.reset();
		}
	},

	onFieldChange: function(field, value) {
		this.checkbox.setValue(!Ext.isEmpty(value));
	}
});
