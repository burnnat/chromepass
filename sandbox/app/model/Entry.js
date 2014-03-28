/**
 *
 */
Ext.define('Pass.model.Entry', {
	extend: 'Ext.data.Model',

	fields:[
		{
			name: 'title',
			type: 'string',
			mapping: 'Key:nodeValue(Title) + Value'
		},
		{
			name: 'username',
			type: 'string',
			mapping: 'Key:nodeValue(UserName) + Value'
		},
		{
			name: 'password',
			type: 'string',
			mapping: 'Key:nodeValue(Password) + Value'
		},
		{
			name: 'url',
			type: 'string',
			mapping: 'Key:nodeValue(URL) + Value'
		},
		{
			name: 'notes',
			type: 'string',
			mapping: 'Key:nodeValue(Notes) + Value'
		},
		{
			name: 'autoTypeEnabled',
			type: 'boolean',
			mapping: 'AutoType > Enabled',
			convert: function(value) {
				return value.toLowerCase() === 'true';
			}
		},
		{
			name: 'autoTypeSequence',
			type: 'string',
			mapping: 'AutoType > DefaultSequence',
			useNull: true
		}
	]
});
