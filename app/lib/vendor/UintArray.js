/**
 * Titanium does not implement Uint8Array. Implementing here...
 */
var UintArray = function(arg1) {
	var subarray = function(start, end) {
		return this.slice(start, end);
	};
	var set_ = function(array, offset) {
		if(arguments.length < 2) offset = 0;
		for (var i = 0, n = array.length; i < n; ++i, ++offset)
			this[offset] = array[i] & 0xFF;
	};
	var result;
	if(typeof arg1 === "number") {
		result = new Array(arg1);
		for (var i = 0; i < arg1; ++i) result[i] = 0;
	} else {
		result = arg1.slice(0);
	}
	result.subarray = subarray;
	result.buffer = result;
	result.byteLength = result.length;
	result.set = set_;
	if(typeof arg1 === "object" && arg1.buffer) {
		result.buffer = arg1.buffer;
	}
	return result;
};

// Define globally.
//global.Uint8Array  = UintArray;
Uint8Array  = UintArray;
//global.Uint32Array = UintArray;
Uint32Array = UintArray;