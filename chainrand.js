/**
 * [chainrand-js]{@link https://github.com/chainrand/chainrand-js}
 *
 * @version 0.0.1
 * @author Kang Yue Sheng Benjamin [chainrand@gmail.com]
 * @copyright Kang Yue Sheng Benjamin 2021
 * @license MIT
 */
( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = factory(global, 1);
	} else {
		factory(global);
	}

} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

	"use strict";
	
	function CRNG(seed) {

		if (arguments.length < 1) seed = '';

		var arrayFill = function (n) { var a = []; while (n--) a.push(0); return a; };

		var isNumber = function (x) { return typeof x == 'number' && !isNaN(x) };
		var isArray = function (x) { return Object.prototype.toString.call(x) === '[object Array]' };

		/**
		 * [js-sha256]{@link https://github.com/emn178/js-sha256}
		 *
		 * @version 0.9.0
		 * @author Chen, Yi-Cyuan [emn178@gmail.com]
		 * @copyright Chen, Yi-Cyuan 2014-2017
		 * @license MIT
		 */
		function sha256(message) {

			var HEX_CHARS = '0123456789abcdef'.split('');
			var EXTRA = [-2147483648, 8388608, 32768, 128];
			var SHIFT = [24, 16, 8, 0];
			var K = [
				0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
				0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
				0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
				0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
				0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
				0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
				0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
				0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
			];

			var blocks = [];

			var _blocks = arrayFill(17);
			var _h0 = 0x6a09e667;
			var _h1 = 0xbb67ae85;
			var _h2 = 0x3c6ef372;
			var _h3 = 0xa54ff53a;
			var _h4 = 0x510e527f;
			var _h5 = 0x9b05688c;
			var _h6 = 0x1f83d9ab;
			var _h7 = 0x5be0cd19;
			var _block = 0;
			var _start = 0;
			var _bytes = 0;
			var _hBytes = 0;
			var _hashed = false;
			var _first = true;
			var _lastByteIndex;

			var update = function (message) {
				var code, index = 0, i, length = message.length, blocks = _blocks;

				while (index < length) {
					if (_hashed) {
						_hashed = false;
						blocks[0] = _block;
						for (i = 1; i < 17; ++i) 
							blocks[i] = 0;
					}

					for (i = _start; index < length && i < 64; ++index) {
						code = message.charCodeAt(index);
						if (code < 0x80) {
							blocks[i >> 2] |= code << SHIFT[i++ & 3];
						} else if (code < 0x800) {
							blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
							blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
						} else if (code < 0xd800 || code >= 0xe000) {
							blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
							blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
							blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
						} else {
							code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
							blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
							blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
							blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
							blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
						}
					}
				
					_lastByteIndex = i;
					_bytes += i - _start;
					if (i >= 64) {
						_block = blocks[16];
						_start = i - 64;
						hash();
						_hashed = true;
					} else {
						_start = i;
					}
				}
				if (_bytes > 4294967295) {
					_hBytes += _bytes / 4294967296 << 0;
					_bytes = _bytes % 4294967296;
				}
			};

			var finalize = function () {
				var blocks = _blocks, i = _lastByteIndex;
				blocks[16] = _block;
				blocks[i >> 2] |= EXTRA[i & 3];
				_block = blocks[16];
				if (i >= 56) {
					if (!_hashed) {
						hash();
					}
					blocks[0] = _block;
					for (i = 1; i < 17; ++i) 
						blocks[i] = 0;
				}
				blocks[14] = _hBytes << 3 | _bytes >>> 29;
				blocks[15] = _bytes << 3;
				hash();
			};

			var hash = function () {
				var a = _h0, b = _h1, c = _h2, d = _h3, e = _h4, f = _h5, g = _h6,
					h = _h7, blocks = _blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;

				for (j = 16; j < 64; ++j) {
					// rightrotate
					t1 = blocks[j - 15];
					s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
					t1 = blocks[j - 2];
					s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
					blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
				}

				bc = b & c;
				for (j = 0; j < 64; j += 4) {
					if (_first) {
						ab = 704751109;
						t1 = blocks[0] - 210244248;
						h = t1 - 1521486534 << 0;
						d = t1 + 143694565 << 0;
						_first = false;
					} else {
						s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
						s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
						ab = a & b;
						maj = ab ^ (a & c) ^ bc;
						ch = (e & f) ^ (~e & g);
						t1 = h + s1 + ch + K[j] + blocks[j];
						t2 = s0 + maj;
						h = d + t1 << 0;
						d = t1 + t2 << 0;
					}
					s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
					s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
					da = d & a;
					maj = da ^ (d & b) ^ ab;
					ch = (h & e) ^ (~h & f);
					t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
					t2 = s0 + maj;
					g = c + t1 << 0;
					c = t1 + t2 << 0;
					s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
					s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
					cd = c & d;
					maj = cd ^ (c & a) ^ da;
					ch = (g & h) ^ (~g & e);
					t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
					t2 = s0 + maj;
					f = b + t1 << 0;
					b = t1 + t2 << 0;
					s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
					s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
					bc = b & c;
					maj = bc ^ (b & d) ^ cd;
					ch = (f & g) ^ (~f & h);
					t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
					t2 = s0 + maj;
					e = a + t1 << 0;
					a = t1 + t2 << 0;
				}

				_h0 = _h0 + a << 0;
				_h1 = _h1 + b << 0;
				_h2 = _h2 + c << 0;
				_h3 = _h3 + d << 0;
				_h4 = _h4 + e << 0;
				_h5 = _h5 + f << 0;
				_h6 = _h6 + g << 0;
				_h7 = _h7 + h << 0;
			};

			var digest = function () {
				finalize();

				var h0 = _h0, h1 = _h1, h2 = _h2, h3 = _h3, h4 = _h4, h5 = _h5,
					h6 = _h6, h7 = _h7;

				var arr = [
					(h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, h0 & 0xFF,
					(h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,
					(h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,
					(h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,
					(h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF,
					(h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, h5 & 0xFF,
					(h6 >> 24) & 0xFF, (h6 >> 16) & 0xFF, (h6 >> 8) & 0xFF, h6 & 0xFF, 
					(h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, h7 & 0xFF
				];
				return arr;
			};

			update(message);
			return digest();
		}

		// AES code adapted from https://github.com/kokke/tiny-AES-c. (Unlicense)

		var sBoxValue = [
			//0     1    2      3     4    5     6     7      8    9     A      B    C     D     E     F
			0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
			0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
			0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
			0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
			0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
			0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
			0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
			0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
			0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
			0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
			0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
			0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
			0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
			0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
			0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
			0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
		];
		
		var _roundKey  = arrayFill(240);
		var _iv        = arrayFill(16);
		var _counter   = arrayFill(16); 
		var _buf       = arrayFill(16);
		var _bufOffset = 0;

		var rCon = [0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

		var expandKey = function (roundKey, key) {
			var i, j, k, t0, t1, t2, t3, u8tmp;
		
			for (i = 0; i < 8; ++i) {
				roundKey[i*4+0] = key[i*4+0];
				roundKey[i*4+1] = key[i*4+1];
				roundKey[i*4+2] = key[i*4+2];
				roundKey[i*4+3] = key[i*4+3];
			}
			
			for (i = 8; i < 4 * (14 + 1); ++i) {
				k = (i - 1) * 4;
				t0 = roundKey[k+0];
				t1 = roundKey[k+1];
				t2 = roundKey[k+2];
				t3 = roundKey[k+3];
				
				if (i % 8 == 0) {
					u8tmp = t0;
					t0 = t1;
					t1 = t2;
					t2 = t3;
					t3 = u8tmp;
				
					t0 = sBoxValue[t0];
					t1 = sBoxValue[t1];
					t2 = sBoxValue[t2];
					t3 = sBoxValue[t3];
					
					t0 = t0 ^ rCon[i>>3];
				}

				if (i % 8 == 4) {
					t0 = sBoxValue[t0];
					t1 = sBoxValue[t1];
					t2 = sBoxValue[t2];
					t3 = sBoxValue[t3];
				}
				
				j = i * 4; k = (i - 8) * 4;
				roundKey[j+0] = roundKey[k+0] ^ t0;
				roundKey[j+1] = roundKey[k+1] ^ t1;
				roundKey[j+2] = roundKey[k+2] ^ t2;
				roundKey[j+3] = roundKey[k+3] ^ t3;
			}	
		}

		var subBytes = function (state) {
			for (var i = 0; i < 16; ++i)
				state[i] = sBoxValue[state[i]];
		}

		var addRoundKey = function (round, state, roundKey) {
			for (var i = 0; i < 16; ++i)
				state[i] ^= roundKey[round * 16 + i];
		}

		var shiftRows = function (state) {
			var temp;
			
			temp         = state[0*4+1];
			state[0*4+1] = state[1*4+1];
			state[1*4+1] = state[2*4+1];
			state[2*4+1] = state[3*4+1];
			state[3*4+1] = temp;
			
			temp         = state[0*4+2];
			state[0*4+2] = state[2*4+2];
			state[2*4+2] = temp;
			
			temp         = state[1*4+2];
			state[1*4+2] = state[3*4+2];
			state[3*4+2] = temp;
			
			temp         = state[0*4+3];
			state[0*4+3] = state[3*4+3];
			state[3*4+3] = state[2*4+3];
			state[2*4+3] = state[1*4+3];
			state[1*4+3] = temp;
		}

		var xtime = function (x) {
			return ((x<<1) ^ (((x>>7) & 1) * 0x1b)) & 255;
		}

		var mixColumns = function (state) {
			var i, tmp, tm, t;
			for (i = 0; i < 4; ++i) {
				t   = state[i*4+0];
				tmp = state[i*4+0] ^ state[i*4+1] ^ state[i*4+2] ^ state[i*4+3] ;
				tm  = state[i*4+0] ^ state[i*4+1] ; tm = xtime(tm);  state[i*4+0] ^= tm ^ tmp ;
				tm  = state[i*4+1] ^ state[i*4+2] ; tm = xtime(tm);  state[i*4+1] ^= tm ^ tmp ;
				tm  = state[i*4+2] ^ state[i*4+3] ; tm = xtime(tm);  state[i*4+2] ^= tm ^ tmp ;
				tm  = state[i*4+3] ^ t ;            tm = xtime(tm);  state[i*4+3] ^= tm ^ tmp ;
			}
		}

		expandKey(_roundKey, sha256(seed));

		var self = function () {
			if (_bufOffset + 8 > 16) {
				_bufOffset = 0;
			}
			if (_bufOffset == 0) {
				for (var i = 0; i < 16; ++i)
					_buf[i] = _counter[i];

				addRoundKey(0, _buf, _iv);

				addRoundKey(0, _buf, _roundKey);

				for (var round = 1; round < 14; ++round) {
					shiftRows(_buf);
					subBytes(_buf);
					mixColumns(_buf);
					addRoundKey(round, _buf, _roundKey);
				}
				
				shiftRows(_buf);
				subBytes(_buf);
				addRoundKey(14, _buf, _roundKey);

				for (var i = 0; i < 16; ++i)
					_iv[i] = _buf[i];

				for (var i = 0; i < 16; ++i) {
					if (_counter[i] < 255) {
						++_counter[i];
						break;
					}
					_counter[i] = 0;
				}
			}
			var result = (
				(_buf[_bufOffset + 1] >> 3) +
				(_buf[_bufOffset + 2] * 32) +
				(_buf[_bufOffset + 3] * 8192) +
				(_buf[_bufOffset + 4] * 2097152) +
				(_buf[_bufOffset + 5] * 536870912) +
				(_buf[_bufOffset + 6] * 137438953472) +
				(_buf[_bufOffset + 7] * 35184372088832) 
			);
			_bufOffset += 8;
			return result / 9007199254740992;
		}; 

		self.random = function () { return self() };

		self.randrange = function (start, stop, step) {
			var t;
			if (!isNumber(start)) {
				if (!isNumber(stop))
					return null;
				t = stop; stop = start; start = t;
			}
			if (!isNumber(stop)) {
				stop = start; start = 0; 
			}
			if (!isNumber(step)) {
				step = 1;
			}
			if (stop < start) {
				step = -step;
			}
			var d = Math.floor(Math.abs((stop - start) / step));
			return start + Math.floor(d * self()) * step;
		};

		self.randint = function (a, b) { 
			var t;
			if (!isNumber(a)) {
				if (!isNumber(b))
					return null; 
				t = b; b = a; a = t;
			}
			if (!isNumber(b)) {
				b = a; a = 0;
			}
			if (b < a) {
				t = b; b = a; a = t;
			}
			return Math.floor(a + (b + 1 - a) * self());
		}

		self.shuffle = function (x) {
			for (var t, j, i = x.length - 1; i > 0; i--) {
				j = Math.floor((i + 1) * self());
				t = x[j];
				x[j] = x[i];
				x[i] = t;
			}
			return x;
		}

		self.sample = function (population, k, weights) {
			var visited = {}, weightsSum = 0, i, j, r, t, n, 
			collected = [], weighted = isArray(weights);

			if (!isArray(population)) {
				return collected; 
			}
			n = population.length;
			if (weighted) {
				n = Math.min(n, weights.length);
				for (i = 0; i < n; ++i) {
					weightsSum += weights[i];
				}	
				weighted = weightsSum > 0;
			} 
			if (!weighted) {
				n = population.length;
				weightsSum = n;
			}
			k = Math.max(0, isNumber(k) ? k : 1);
			for (j = 0; j < k; ++j) {
				r = weightsSum * self();
				for (i = 0; i < n; ++i) if (!visited[i]) {
					r -= weighted ? weights[i] : 1;
					if (r < 0) {
						collected.push(population[i]);
						weightsSum -= weighted ? weights[i] : 1;
						visited[i] = 1;
						i = n;
					}
				}
			}
			if (collected.length < k) {
				for (i = 0; i < n; ++i) if (!visited[i]) {
					collected.push(population[i]);
				}
			}
			return self.shuffle(collected);
		}

		self.choice = function (population, weights) {
			var collected = self.sample(population, 1, weights);
			return collected.length ? collected[0] : null;
		}

		var gaussSpare, gaussHasSpare = 0;
		self.gauss = function(mu, sigma) {
			var s, u, v;
			if (!isNumber(sigma)) {
				sigma = 1;
			}
			if (!isNumber(mu)) {
				mu = 0;
			}
			if (gaussHasSpare) {
				gaussHasSpare = 0;
				return gaussSpare * sigma + mu;
			}
			while (1) {
				u = 2 * self() - 1;
				v = 2 * self() - 1;
				s = u * u + v * v;
				if (!(s >= 1 || s === 0))
					break;
			}
			s = Math.sqrt(-2 * Math.log(s) / s);
			gaussHasSpare = 1;
			gaussSpare = v * s;
			return u * s * sigma + mu;
		}

		return self;
	}

	var chainrand = { CRNG: CRNG };
	
	if (typeof define === "function" && define.amd) {
		define("chainrand", [], function() {
			return chainrand;
		});
	}
	
	if (!noGlobal) {
		window.chainrand = chainrand;
	}

	return chainrand;
});