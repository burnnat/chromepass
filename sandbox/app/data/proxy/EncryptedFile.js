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

		if (password != null) {
			keys.push(CryptoJS.SHA256(this.password));
		}

		var keyFile = this.keyFile;

		if (keyFile != null) {
			var dataview = this.parseKeyFile(keyFile);
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
		var reader = this.getReader();

		this.parseData(this.buffer)
			.then(
				function(data) {
					var result = reader.read(data);

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
			)
			.catch(
				function(e) {
					var error = e.message;

					console.error(error);
					operation.setException(error);
				}
			)
			.then(
				function() {
					Ext.callback(callback, scope, [operation]);
				}
			);
	},

	parseKeyFile: function(keyFile) {
		var dataView = new jDataView(keyFile, 0, keyFile.length, true);
		var data = dataView.getString();

		var xml = new DOMParser().parseFromString(data, "text/xml");
		var keyData = Ext.dom.Query.selectNode('KeyFile > Key > Data', xml);

		if (keyData) {
			// test XML key file
			keyData = atob(keyData.textContent);

			if (keyData.length == 32) {
				keyData = CryptoJS.enc.Latin1.parse(keyData);
			}
			else {
				keyData = null;
			}
		}
		else {
			keyData = null;
		}

		if (keyData == null) {
			// not XML key file
			if (data.length == 32) {
				// test 32-byte key file
				keyData = CryptoJS.enc.Latin1.parse(data);
			}
			else if (data.length == 64) {
				// not 32-byte key, test 64-byte hex encoded
				keyData = CryptoJS.enc.Hex.parse(data);

				if (keyData.length != 32) {
					keyData = null;
				}
			}
		}

		if (keyData == null) {
			// not XML and not key file
			keyData = CryptoJS.enc.Latin1.parse(data);
			keyData = CryptoJS.SHA256(keyData);
		}

		return keyData;
	},

	parseData: function(buffer) {
		var me = this;
		var ids = me.constants;

		if (this.xml) {
			return Promise.resolve(this.xml);
		}

		return new Promise(function(resolve, reject) {
			var dataView = new jDataView(buffer, 0, buffer.length, true);

			var sig1 = dataView.getUint32();
			me.assert(sig1, 0x9AA2D903, "Invalid version");

			var sig2 = dataView.getUint32();
			me.assert(sig2, 0xB54BFB67, "Invalid version");

			var fileVersion = dataView.getUint32();
			me.assert(fileVersion, 0x00030001, "Invalid file version");

			me.parseHeader(dataView)
				.delay(2)
				.then(function(header) {
					me.getAes(header)
						.then(function(aes) {
							return me.decryptData(dataView.getString(), aes.key, aes.iv);
						})
						.delay(2)
						.then(function(decrypted) {
							dataView = new jDataView(decrypted, 0, decrypted.length, true);

							me.assert(
								dataView.getString(32),
								header[ids.StreamStartBytes],
								"Start bytes do not match"
							);

							var xml = (
								new DOMParser()
									.parseFromString(
										me.inflateData(dataView),
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

							me.assert(
								streamKey.length,
								32,
								"Invalid protected stream key"
							);

							me.unprotectValues(xml, streamKey);
							me.xml = xml;

							resolve(xml);
						});
				});

		});
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

		return Promise.resolve(header);
	},

	getAes: function(header) {
		var ids = this.constants;

		return (
			this.getTransformedKey(
				header[ids.TransformSeed],
				header[ids.TransformRounds]
			).then(function(transformedKey) {
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

				return {
					key: aesKey,
					iv: aesIV
				};
			})
		);
	},

	getTransformedKey: function(seed, rounds) {
		var tmpKey = {};
		var compositeKey = this.compositeKey;

		tmpKey[0] = CryptoJS.enc.Hex.parse(compositeKey.substring(0, 32));
		tmpKey[1] = CryptoJS.enc.Hex.parse(compositeKey.substring(32, 64));

		var key = CryptoJS.enc.Latin1.parse(seed);
		var iv = CryptoJS.enc.Hex.parse((new Array(16)).join("\x00"));

		var sequence = Promise.resolve(tmpKey);

		console.log('Transforming with ' + rounds + ' rounds');

		for (var i = 0; i < rounds; ++i) {
			sequence = sequence.then(function(tmpKey) {
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

				return tmpKey;
			});

			if (i % 1000 === 0) {
				sequence = sequence.delay(2);
			}
		}

		return sequence.then(function(tmpKey) {
			return (
				CryptoJS.SHA256(
					CryptoJS.enc.Hex.parse(
						tmpKey[0].toString(CryptoJS.enc.Hex) +
						tmpKey[1].toString(CryptoJS.enc.Hex)
					)
				).toString(CryptoJS.enc.Hex)
			);
		});
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

		return Promise.resolve(decrypted.toString(CryptoJS.enc.Latin1));
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
			throw new Error(message + " (expected " + expected + ", actually " + actual + ")");
		}
	}
});
