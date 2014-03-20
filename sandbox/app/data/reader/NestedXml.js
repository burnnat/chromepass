/**
 * An XML reader implementation that allows a differently-named
 * root node at the top level of a nested XML document.
 */
Ext.define('Pass.data.reader.NestedXml', {
	extend: 'Ext.data.reader.Xml',

	/**
	 * @cfg {String}
	 */
	top: null,

	/**
	 * @cfg {String}
	 */
	topRoot: null,

	getRoot: function(data) {
		var nodeName = data.nodeName;

		if (nodeName && nodeName === this.top) {
			return Ext.dom.Query.selectNode(this.topRoot, data);
		}
		else {
			return this.callParent(arguments);
		}
	},

	getAssociatedDataRoot: function(data) {
		return data;
	}
});
