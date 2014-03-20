/**
 *
 */
Ext.define('Pass.model.Entry', {
	extend: 'Ext.data.Model',

	fields:[
		{
			name: 'title',
			mapping: 'Key:nodeValue(Title) + Value'
		},
		{
			name: 'username',
			mapping: 'Key:nodeValue(UserName) + Value'
		},
		{
			name: 'password',
			mapping: 'Key:nodeValue(Password) + Value'
		},
		{
			name: 'url',
			mapping: 'Key:nodeValue(URL) + Value'
		},
		{
			name: 'notes',
			mapping: 'Key:nodeValue(Notes) + Value'
		}
	]
});
