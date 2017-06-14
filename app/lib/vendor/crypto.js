// Requires: packages.js
/*
 * SecureRandom.js
 * A Secure Random Number Generator 
 * See SecureRandom.readme.txt for further information.
 *
 * ACKNOWLEDGMENT
 *
 *     This library is originally written by Tom Wu
 *
 *     Copyright (c) 2005  Tom Wu
 *     All Rights Reserved.
 *     http://www-cs-students.stanford.edu/~tjw/jsbn/
 *
 * MODIFICATION
 *
 *     Some modifications are applied by Atsushi Oka
 *
 *     Atushi Oka
 *     http://oka.nu/
 *
 *     - Packaged
 *     - Added Object-Oriented Interface.
 */

var SecureRandom = (function () {
/*
function initRNG( packages ) {
    __unit( "SecureRandom.js" );
    __uses( "packages.js" );
*/
    /////////////////////////////////////////////
    // import
    /////////////////////////////////////////////
    // var Arcfour = __package( packages ).Arcfour;

    /////////////////////////////////////
    // implementation
    /////////////////////////////////////
    
    //
    // Arcfour
    //
    var Arcfour = function () {
	    this.i = 0;
	    this.j = 0;
	    this.S = new Array();
    };

    // Initialize arcfour context from key, an array of ints, each from [0..255]
    Arcfour.prototype.init = function (key) {
	    var i, j, t;
	    for(i = 0; i < 256; ++i) this.S[i] = i;
	    j = 0;
	    for(i = 0; i < 256; ++i) {
			j = (j + this.S[i] + key[i % key.length]) & 255;
			t = this.S[i];
			this.S[i] = this.S[j];
			this.S[j] = t;
	    }
	    this.i = 0;
	    this.j = 0;
    };

    Arcfour.prototype.next = function () {
	    var t;
	    this.i = (this.i + 1) & 255;
	    this.j = (this.j + this.S[this.i]) & 255;
	    t = this.S[this.i];
	    this.S[this.i] = this.S[this.j];
	    this.S[this.j] = t;
	    return this.S[ ( t + this.S[this.i] ) & 255 ];
    };

    
    // Plug in your RNG constructor here
    Arcfour.create = function () {
    	return new Arcfour();
    };

    // Pool size must be a multiple of 4 and greater than 32.
    // An array of bytes the size of the pool will be passed to init()
    Arcfour.rng_psize= 256;

    //
    // SecureRandom
    //

    var rng_state = null;
    var rng_pool = [];
    var rng_pptr = 0;
    
    // Mix in a 32-bit integer into the pool
    var rng_seed_int= function (x) {
	    // FIXED 7 DEC,2008 http://oka.nu/
	    // >>
	    // rng_pool[rng_pptr++] ^= x & 255;
	    // rng_pool[rng_pptr++] ^= (x >> 8) & 255;
	    // rng_pool[rng_pptr++] ^= (x >> 16) & 255;
	    // rng_pool[rng_pptr++] ^= (x >> 24) & 255;
	    rng_pool[rng_pptr] ^= x & 255;
	    rng_pptr++;
	    rng_pool[rng_pptr] ^= (x >> 8) & 255;
	    rng_pptr++;
	    rng_pool[rng_pptr] ^= (x >> 16) & 255;
	    rng_pptr++;
	    rng_pool[rng_pptr] ^= (x >> 24) & 255;
	    rng_pptr++;
	    // <<
	    if(rng_pptr >= Arcfour.rng_psize) rng_pptr -= Arcfour.rng_psize;
    };
    
    // Mix in the current time (w/milliseconds) into the pool
    var rng_seed_time= function () {
    	rng_seed_int( new Date().getTime() );
    };
    
    // Initialize the pool with junk if needed.
    var pool_init = function () {
    	var t;
		/*
		    if ( navigator.appName == "Netscape" && navigator.appVersion < "5" && window.crypto ) {
			// Extract entropy (256 bits) from NS4 RNG if available
			var z = window.crypto.random(32);
			for(t = 0; t < z.length; ++t)
			rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
		    }  
		*/
	    while(rng_pptr < Arcfour.rng_psize) {  // extract some randomness from Math.random()
			t = Math.floor(65536 * Math.random());
			rng_pool[rng_pptr++] = t >>> 8;
			rng_pool[rng_pptr++] = t & 255;
	    }
	    rng_pptr = 0;
	    rng_seed_time();
	};
    
    var rng_get_byte= function (seed) {
	    if ( rng_state == null ) {
	    	rng_seed_int(seed + globals.Accelerometer);
	    	rng_state = Arcfour.create();
			rng_state.init( rng_pool );
			for(rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr) rng_pool[rng_pptr] = 0;
			rng_pptr = 0;
		}
    	return rng_state.next();
    };
    
    var SecureRandom = function () { };
    SecureRandom.prototype.nextBytes = function (ba, seed) {
    	for( var i = 0; i < ba.length; ++i ){
    		ba[i] = rng_get_byte(seed);
    	}
    };

    // initialize
    pool_init();

    ///////////////////////////////////////////
    // export
    ///////////////////////////////////////////
    // __package( packages, path ).RNG = RNG;
    // __package( packages, path ).SecureRandom = SecureRandom;
	/*
	    __export( packages, "titaniumcore.crypto.SecureRandom", SecureRandom );
	};
	initRNG( this );
	*/

	return SecureRandom;
}());

function randomBytes(size, seed){
	var random = new SecureRandom();
    var buf = new Array(size);
    random.nextBytes(buf, seed);
    
    buf.readUInt32BE = function (offset) {
		return (this[offset] * 0x1000000) + ((this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3]);
	};
    
    return buf;
}
exports.randomBytes = randomBytes;
// vim:ts=8 sw=4:noexpandtab: