module.exports = (function() {
	var self = {};
	
	self.set = function( verifies ){
		self.verifies = verifies;
	};
	
	self.push = function( verify ){
		if( self.verifies == null ) self.verifies = new Array();
		self.verifies.push(verify);
	};
	
	self.unshift = function( verify ){
		if( self.verifies == null ) self.verifies = new Array();
		self.verifies.unshift(verify);
	};
	
	self.check = function(){
		for(var i = 0; i < self.verifies.length; i++ ){
			var verify = self.verifies[i];
			if( verify.type === 'number' ){
				if( isNaN(verify.target.value) ){
					return {target: verify.target, message: L('text_inputverify_number').format({ 'name': verify.name })};
				}
			}
			if( 'equal' in verify ){
				if( verify.target.value != verify.equal.value ) return {target: verify.target, message: L('text_inputverify_equal').format({ 'name': verify.name })};
			}
			if( 'over' in verify ){
				if( verify.over == 0 && verify.target.value.length <= 0 ){
					return {target: verify.target, message: L('text_inputverify_empty').format({ 'name': verify.name })};
				}
				if( verify.target.value.length < verify.over ){
					return {target: verify.target, message: L('text_inputverify_more').format({ 'name': verify.name, 'over': verify.over })};
				}
			}
			if( 'shouldvalue' in verify ){
				if( verify.target.value <= 0 ){
					return {target: verify.target, message: L('text_inputverify_shouldvalue').format({ 'name': verify.name })};
				}
			}
		}
		return true;
	};
	
	return self;
}());