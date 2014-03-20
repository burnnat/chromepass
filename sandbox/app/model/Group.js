/**
 *
 */
Ext.define('Pass.model.Group', {
	extend: 'Ext.data.Model',
	requires: [
		'Ext.data.association.HasMany',
		'Ext.data.reader.Reader',
		'Ext.data.reader.Xml',
		'Pass.model.Entry'
	],

	fields: [
		{
			name: 'text',
			mapping: 'Name'
		},
		{
			name: 'expanded',
			mapping: 'IsExpanded'
		}
	],

	associations: [
		{
			type: 'hasMany',
			model: 'Pass.model.Entry',
			name: 'entries',
			associationKey: 'Entry',
			reader: {
				type: 'xml',
				root: 'Group',
				record: '>Entry'
			}
		}
	]
});
