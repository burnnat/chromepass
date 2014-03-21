/**
 *
 */
Ext.define('Pass.data.proxy.EncryptedFile', {
	extend: 'Ext.data.proxy.Proxy',

	buffer: null,

	constants: {
		EndOfHeader: 0,
		Comment: 1,
		CipherID: 2,
		CompressionFlags: 3,
		MasterSeed: 4,
		TransformSeed: 5,
		TransformRounds: 6,
		EncryptionIV: 7,
		ProtectedStreamKey: 8,
		StreamStartBytes: 9,
		InnerRandomStreamID: 10
	},

	/**
	 * @cfg {String}
	 */
	password: null,

	/**
	 * @cfg
	 */
	keyFile: null,

	/**
	 * @private
	 * @property
	 */
	compositeKey: null,

	constructor: function() {
		this.callParent(arguments);

		var keys = [];

		var password = this.password;

		if (password !== null) {
			keys.push(CryptoJS.SHA256(this.password));
		}

		var keyFile = this.keyFile;

		if (keyFile !== null) {
			// TODO: add key file to composite key
		}

		this.compositeKey = this.combineKeys(keys);
	},

	combineKeys: function(keys) {
		var compositeKey = keys.reduce(
			function(previous, current) {
				return previous + current.toString(CryptoJS.enc.Hex);
			},
			''
		);

		compositeKey = CryptoJS.enc.Hex.parse(compositeKey);

		console.log("Composite Key: " + compositeKey);

		compositeKey = (
			CryptoJS.SHA256(compositeKey)
				.toString(CryptoJS.enc.Hex)
				.toString(CryptoJS.enc.Hex)
		);

		console.log("Hashed Composite Key: " + compositeKey);

		return compositeKey;
	},

	read: function(operation, callback, scope) {
		var buffer = this.buffer;

		try {
			var data = this.parseData(
				operation,
				new jDataView(buffer, 0, buffer.length, true)
			);

			var result = this.getReader().read(data);

			if (result.success !== false) {
				operation.resultSet = result;
				operation.commitRecords(result.records);
				operation.setCompleted();
				operation.setSuccessful();
			}
			else {
				operation.setException(result.message);
			}
		}
		catch (e) {
			if (Ext.isString(e)) {
				console.error(e);
				operation.setException(e);
			}
			else {
				throw e;
			}
		}

		Ext.callback(callback, scope, [operation]);
	},

	parseData: function(operation, dataView) {
		if (this.xml) {
			return xml;
		}

		var ids = this.constants;

		var sig1 = dataView.getUint32();
		this.assert(sig1, 0x9AA2D903, "Invalid version");

		var sig2 = dataView.getUint32();
		this.assert(sig2, 0xB54BFB67, "Invalid version");

		var fileVersion = dataView.getUint32();
		this.assert(fileVersion, 0x00030001, "Invalid file version");

		var header = this.parseHeader(dataView);

		var transformedKey = this.getTransformedKey(header[ids.TransformSeed], header[ids.TransformRounds]);
		console.log("Transformed Key: " + transformedKey);

		var masterSeed = (
			CryptoJS.enc.Latin1
				.parse(header[ids.MasterSeed])
				.toString(CryptoJS.enc.Hex)
		);

		var combinedKey = CryptoJS.enc.Hex.parse(masterSeed + transformedKey);

		var aesKey = CryptoJS.SHA256(combinedKey);
		console.log("AES Key: " + aesKey);

		var aesIV = CryptoJS.enc.Latin1.parse(header[ids.EncryptionIV]);
		console.log("AES IV: " + aesIV);

		var decrypted = this.decryptData(dataView.getString(), aesKey, aesIV);
		dataView = new jDataView(decrypted, 0, decrypted.length, true);

		this.assert(
			dataView.getString(32),
			header[ids.StreamStartBytes],
			"Start bytes do not match"
		);

		var xml = (
			new DOMParser()
				.parseFromString(
					this.inflateData(dataView),
					'text/xml'
				)
		);

		var streamKey = CryptoJS.SHA256(
			CryptoJS.enc.Latin1.parse(
				header[ids.ProtectedStreamKey]
			)
		);
		console.log("Protected Stream Key: " + streamKey);

		streamKey = streamKey.toString(CryptoJS.enc.Latin1);

		this.assert(
			streamKey.length,
			32,
			"Invalid protected stream key"
		);

		this.unprotectValues(xml, streamKey);
		this.xml = xml;

		return xml;
	},

	parseHeader: function(dataView) {
		var ids = this.constants;

		var header = {};
		var fieldId, fieldSize, data;

		do {
			fieldId = dataView.getUint8();
			fieldSize = dataView.getUint16();
			data = dataView.getString(fieldSize);

			switch (fieldId) {
				case ids.TransformRounds:
					var v = new jDataView(data, 0, data.length, true);
					header[fieldId] = v.getUint64();
					break;
				case ids.EndOfHeader:
					break;
				default:
					header[fieldId] = data;
			}
		}
		while (fieldId !== ids.EndOfHeader);

		this.assert(
			header[ids.MasterSeed].length,
			32,
			"Master seed not 32 bytes"
		);

		this.assert(
			header[ids.TransformSeed].length,
			32,
			"Transform seed not 32 bytes"
		);

		this.assert(
			header[ids.InnerRandomStreamID],
			"\x02\x00\x00\x00",
			"Not Salsa20 CrsAlgorithm"
		);

		this.assert(
			header[ids.CipherID],
			"\x31\xC1\xF2\xE6\xBF\x71\x43\x50\xBE\x58\x05\x21\x6A\xFC\x5A\xFF",
			"Not AES"
		);

		return header;
	},

	getTransformedKey: function(seed, rounds) {
		var tmpKey = {};
		var compositeKey = this.compositeKey;

		tmpKey[0] = CryptoJS.enc.Hex.parse(compositeKey.substring(0, 32));
		tmpKey[1] = CryptoJS.enc.Hex.parse(compositeKey.substring(32, 64));

		var key = CryptoJS.enc.Latin1.parse(seed);
		var iv = CryptoJS.enc.Hex.parse((new Array(16)).join("\x00"));

		for (var i = 0; i < rounds; ++i) {
			for (var j = 0; j < 2; ++j) {
				var encrypted = CryptoJS.AES.encrypt(
					tmpKey[j],
					key,
					{
						mode: CryptoJS.mode.ECB,
						iv: iv,
						padding: CryptoJS.pad.NoPadding
					}
				);

				tmpKey[j] = encrypted.ciphertext;
			}
		}

		tmpKey = CryptoJS.enc.Hex.parse(
			tmpKey[0].toString(CryptoJS.enc.Hex) +
			tmpKey[1].toString(CryptoJS.enc.Hex)
		);

		return CryptoJS.SHA256(tmpKey).toString(CryptoJS.enc.Hex);
	},

	decryptData: function(data, key, iv) {
		var cipherParams = CryptoJS.lib.CipherParams.create({
			ciphertext: CryptoJS.enc.Latin1.parse(data)
		});

		var decrypted = CryptoJS.AES.decrypt(
			cipherParams,
			key,
			{
				mode: CryptoJS.mode.CBC,
				iv: iv,
				padding: CryptoJS.pad.Pkcs7
			}
		);

		// console.log("Decrypted: " + decrypted);

		return decrypted.toString(CryptoJS.enc.Latin1);
	},

	inflateData: function(dataView) {
		var gzipData = "";

		var blockId = 0;
		var blockHash, computedHash;
		var blockSize, blockData;

		while (true) {
			console.log("Unzipping block " + blockId);

			this.assert(
				dataView.getUint32(),
				blockId,
				"Wrong block from gzip stream"
			);

			++blockId;

			blockHash = dataView.getString(32);
			blockSize = dataView.getUint32();

			if (blockSize === 0) {
				for (var i = 0; i < 32; ++i) {
					this.assert(
						blockHash[i],
						"\x00",
						"blockHash not all zeroes"
					);
				}

				break;
			}

			blockData = dataView.getString(blockSize);
			computedHash = CryptoJS.SHA256(CryptoJS.enc.Latin1.parse(blockData));

			this.assert(
				blockHash,
				computedHash.toString(CryptoJS.enc.Latin1),
				"Block hash does not match"
			);

			gzipData += blockData;
		}

		return this.decodeUtf8(
			zip_inflate(
				// ignore first 10 bytes for GZip header
				gzipData.substring(10)
			)
		);
	},

	unprotectValues: function(data, streamKey) {
		var salsaKey = new Array(32);

		for (var i = 0; i < 32; ++i) {
			salsaKey[i] = streamKey.charCodeAt(i) & 0xFF;
		}

		var iv = new Uint8Array([0xE8, 0x30, 0x09, 0x4B, 0x97, 0x20, 0x5D, 0x2A]);
		var salsa = new Salsa20(salsaKey, iv);

		var reader = this.getReader();

		Ext.Array.forEach(
			Ext.dom.Query.select('*[Protected=True]', data),
			function(node) {
				var textNode = node.firstChild;

				if (!textNode) {
					return;
				}

				var value = atob(textNode.nodeValue);
				var xorbuf = salsa.getBytes(value.length);

				var r = new Array();

				for (var k = 0; k < value.length; ++k) {
					r[k] = String.fromCharCode(value.charCodeAt(k) ^ xorbuf[k]);
				}

				textNode.nodeValue = this.decodeUtf8(r.join(''));
				node.removeAttribute('Protected');
			},
			this
		);
	},

	decodeUtf8: function(value) {
		return decodeURIComponent(escape(value));
	},

	assert: function(actual, expected, message) {
		if (actual !== expected) {
			throw message + " (expected " + expected + ", actually " + actual + ")";
		}
	}
});
