module.exports = (function() {
	var self = {};
	
	require('vendor/UintArray');
	var bitcore = require('vendor/bitcore');
	bitcore.Networks.defaultNetwork = bitcore.Networks.livenet;
	if( globals.network === 'testnet' ){
		bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;
	}
	
	var MnemonicJS = require('vendor/mnemonic');
	var account = null;
	var basePath = 'm/0\'/0/';
	
	self.signMessage = function(message){
		return bitcore.signMessage(message,self.getPrivKey());
	};
	
	self.verifyMessage = function(message,signature,address){
		return bitcore.verifyMessage(message,signature,address);
	};
	
	self.init = function(passphrase, derive, nokeep){
		if( passphrase == null ) return null;
		
		var words = passphrase.split(' ');
		var seed = new MnemonicJS(words).toHex();
		
		var bitcore = require('vendor/bitcore');
		var master = bitcore.HDPrivateKey.fromSeed(seed);
		
		var d = basePath + '0';
		if( derive != null ) d = derive;
		
		var masterderive = master.derive( d );
		if( !nokeep ) account = masterderive;
		
		return masterderive;
	};
	
	self.createHDAddress = function( d ){
		var _requires = globals.requires;
		var derive = self.init(_requires['cache'].data.passphrase, basePath + d, true);
		
		return self.getAddress( derive );
	};
	
	self.changeHD = function( d ){
		var _requires = globals.requires;
		
		self.init(_requires['cache'].data.passphrase, basePath + d);
		
		_requires['cache'].data.address = self.getAddress();
		_requires['cache'].save();
		
		globals.currentHD = d;
		
		var f3 = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'qr_address.png');
		if( f3.exists() ){
			f3.deleteFile();
		}
		return _requires['cache'].data.address;
	};
	
	self.getpassphrase = function( passphrase ){
		var words = null;
		if( passphrase != null ) words = passphrase.split(' ');
		var m;
		try{
			m = new MnemonicJS(words);
		}
		catch(e){ throw e; }
		
		return m.toWords().toString().replace(/,/gi, ' ');
	};
	
	self.getAddress = function( derive ){
		if( account == null && derive == null ) return null;
		
		var d = account;
		if( derive != null ) d = derive;
		
		var priv = bitcore.PrivateKey(d.privateKey);
		return priv.toAddress().toString();
	};
	
	self.getAddressFromWIF = function( WIF ){
		if( WIF == null ) return null;
		
		var priv = bitcore.PrivateKey.fromWIF(WIF);
		return priv.toAddress().toString();
	};
	
	self.getPrivKey = function(){
		if( account == null ) return null;
		return account.privateKey;
	};
	
	self.getPrivKeyFromWIF = function( WIF ){
		if( WIF == null ) return null;
		
		return bitcore.PrivateKey.fromWIF(WIF);
	};
	
	self.checkTransaction = function( raw_tx, source, dest ){
		var tx = bitcore.Transaction( raw_tx );
		var outputsValid = tx.outputs.map(function(output, idx) {
			if( output.satoshis <= 5430 ) return true;
			
			var address = null;
			switch (output.script.classify()) {
		      case bitcore.Script.types.PUBKEY_OUT:
		        address = output.script.toAddress(bitcore.Networks.livenet).toString();
		        break;
		
		      case bitcore.Script.types.PUBKEYHASH_OUT:
		        address = output.script.toAddress(bitcore.Networks.livenet).toString();
		        break;
		
		      case bitcore.Script.types.SCRIPTHASH_OUT:
		        address = output.script.toAddress(bitcore.Networks.livenet).toString();
		        break;
		
		      case bitcore.Script.types.MULTISIG_OUT:
		        if (!output.script.isMultisigOut()) return [];
		        var nKeysCount = bitcore.Opcode(script.chunks[script.chunks.length - 2].opcodenum).toNumber() - bitcore.Opcode.map.OP_1 + 1;
				var pubKeys = script.chunks.slice(script.chunks.length - 2 - nKeysCount, script.chunks.length - 2);
				var addresses = pubKeys.map(function(pubKey) {
					return bitcore.Address(bitcore.crypto.Hash.sha256ripemd160(pubKey.buf), bitcore.Networks.livenet, bitcore.Address.PayToPublicKeyHash).toString();
				});
		        
		        var isSource = dest.sort().join() == addresses.sort().join();
		        var isDest = source.sort().join() == addresses.sort().join();
		
		        return output.satoshis <= Math.max(MULTISIG_DUST_SIZE, REGULAR_DUST_SIZE * 2) || isSource || isDest;
		
		      case bitcore.Script.types.DATA_OUT:
		        return true;
		
		      default:
		        return false;
		    }
		    
		    var containsSource = _.intersection([address], source).length > 0;
		    var containsDest = _.intersection([address], dest).length > 0;
			
			return containsDest || containsSource;
		});
		return outputsValid.filter(function(v) { return !v; }).length === 0;
	};
	
	self.sign = function( raw_tx, params ){
		var privkey = self.getPrivKey();
		var address = privkey.toAddress().toString();
		
		var check_sourse = null;
		var check_destination = null;
		
		try{
			if( params.check != null ){
				check_sourse = params.check.source;
				check_destination = params.check.destination;
				
				if( params.check.WIF != null ){
					privkey = self.getPrivKeyFromWIF(params.check.WIF);
				}
			}
			var checked = self.checkTransaction( raw_tx, [address, check_sourse], [check_destination] );
			if( !checked ){
				
				globals.requires['analytics'].trackEvent({
					name: 'native_exception',
					parameters: {
						'type': 'invalid_transaction',
						'source': address,
						'destination': params.destination,
						'raw_tx': raw_tx
					}
				});
				
				throw new Error(L('text_error_invalid_transaction'));
			}
			var array_inputs = [];
			var tx = bitcore.Transaction(raw_tx);
			tx.inputs.forEach(function( input, idx ){
				var script = bitcore.Script(input._scriptBuffer.toString('hex'));
				var multiSigInfo;
	        	var addresses = [];
	        	
	        	array_inputs.push(input.toObject().prevTxId);
	        	
	        	switch (script.classify()) {
	            case bitcore.Script.types.PUBKEY_OUT:
	              inputObj = input.toObject();
	              inputObj.output = bitcore.Transaction.Output({
	                script: input._scriptBuffer.toString('hex'),
	                satoshis: 0 // we don't know this value, setting 0 because otherwise it's going to cry about not being an INT
	              });
	              tx.inputs[idx] = new bitcore.Transaction.Input.PublicKey(inputObj);
	
	              addresses = [script.toAddress(bitcore.Networks.livenet).toString()];
				  break;//return cb(null, addresses);
	
	            case bitcore.Script.types.PUBKEYHASH_OUT:
	              inputObj = input.toObject();
	              inputObj.output = bitcore.Transaction.Output({
	                script: input._scriptBuffer.toString('hex'),
	                satoshis: 0 // we don't know this value, setting 0 because otherwise it's going to cry about not being an INT
	              });
	              tx.inputs[idx] = new bitcore.Transaction.Input.PublicKeyHash(inputObj);
	
	              addresses = [script.toAddress(bitcore.Networks.livenet).toString()];
	
	              break;//return cb(null, addresses);
	
	            case bitcore.Script.types.MULTISIG_IN:
	              throw new Error(L('text_error_invalid_pubkey'));
				  /*
	              inputObj = input.toObject();
	              return failoverAPI(
	                'get_script_pub_key',
	                {tx_hash: inputObj.prevTxId, vout_index: inputObj.outputIndex},
	                function(data) {
	                  inputObj.output = bitcore.Transaction.Output({
	                    script: data['scriptPubKey']['hex'],
	                    satoshis: bitcore.Unit.fromBTC(data['value']).toSatoshis()
	                  });
	
	                  multiSigInfo = CWBitcore.extractMultiSigInfoFromScript(inputObj.output.script);
	
	                  inputObj.signatures = bitcore.Transaction.Input.MultiSig.normalizeSignatures(
	                    tx,
	                    new bitcore.Transaction.Input.MultiSig(inputObj, multiSigInfo.publicKeys, multiSigInfo.threshold),
	                    idx,
	                    script.chunks.slice(1, script.chunks.length).map(function(s) { return s.buf; }),
	                    multiSigInfo.publicKeys
	                  );
	
	                  tx.inputs[idx] = new bitcore.Transaction.Input.MultiSig(inputObj, multiSigInfo.publicKeys, multiSigInfo.threshold);
	
	                  addresses = CWBitcore.extractMultiSigAddressesFromScript(inputObj.output.script);
	
	                  return cb(null, addresses);
	                }
	              );*/
				
	            case bitcore.Script.types.MULTISIG_OUT:
	              inputObj = input.toObject();
	              inputObj.output = bitcore.Transaction.Output({
	                script: input._scriptBuffer.toString('hex'),
	                satoshis: 0 // we don't know this value, setting 0 because otherwise it's going to cry about not being an INT
	              });
	
	              multiSigInfo = CWBitcore.extractMultiSigInfoFromScript(inputObj.output.script);
	              tx.inputs[idx] = new bitcore.Transaction.Input.MultiSig(inputObj, multiSigInfo.publicKeys, multiSigInfo.threshold);
	
	              addresses = CWBitcore.extractMultiSigAddressesFromScript(inputObj.output.script);
	
	              break;
	
	            case bitcore.Script.types.SCRIPTHASH_OUT:
	              break;
	
	            case bitcore.Script.types.DATA_OUT:
	            case bitcore.Script.types.PUBKEY_IN:
	            case bitcore.Script.types.PUBKEYHASH_IN:
	            case bitcore.Script.types.SCRIPTHASH_IN:
	              break;
	
	            default:
	              throw new Error(L('text_error_invalid_pubkey'));
	              	//"Unknown scriptPubKey [" + script.classify() + "](" + script.toASM() + ");
	          }
			});
			tx.sign(privkey);
			var opts = {
	          'disableIsFullySigned': false,
	          'disableSmallFees': true,
	          'disableLargeFees': true,
	          'disableDustOutputs': true,
	          'disableMoreOutputThanInput': true
	        };
	        try{
				var serialized = tx.serialize(opts);
				params.callback(serialized, array_inputs);
			}
			catch(e){
				var message = L('text_error_failed_sign');
				if( check_sourse != null ) message += L('text_error_failed_sign_source').format({'source': check_sourse});
				throw new Error(message);
			}
		}
		catch(e){
			params.fail(e.message);
		}
		//bitcore.signrawtransaction(raw_tx, self.getPrivKey(), params);
	};
	
	self.getPublicKey = function( passphrase, bool ){
		if( bool ) self.init(passphrase);
		if( account == null ) return null;
		return account.publicKey.toString();
	};
	
	self.URI = function( uri ){
		if( bitcore.URI.isValid(uri) ){
			var uri = new bitcore.URI(uri);
			if( uri.amount != null ) uri.amount /= 1e8;
			return uri;
		}
		else return null;	
	};
	
    return self;
}());