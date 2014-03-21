/**
 * Chrome uses a fake path for file inputs, so only show the filename.
 */
Ext.define('Chrome.overrides.form.field.File', {
	override: 'Ext.form.field.File',

	onFileChange: function(button, e, value) {
		return this.callParent([
			button,
			e,
			value.replace(
				/^.*[\/|\\]/,
				''
			)
		]);
	}
});
