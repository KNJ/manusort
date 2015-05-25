var cloz = function(base, ex){
	base = base || {};
	var derived = {};
	var o = Object.create(base);
	var isStr = function(prop){
		return Object.prototype.toString.call(prop) === '[object String]';
	};
	var isObj = function(prop){
		return Object.prototype.toString.call(prop) === '[object Object]';
	};

	derived.get = function(prop){
		if (!isStr(prop)) {
			throw new Error('The first argument of cloz.get() must be string.');
		}
		if (typeof o[prop] === 'undefined') {
			if (base.hasOwnProperty('get')) {
				return base.get.apply(this, arguments);
			}
			else {
				throw new Error('Cannot find property "' + prop + '"');
			}
		}
		else if (typeof o[prop] === 'function') {
			var args = [];
			for (var i = 1; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
			return o[prop].apply(this, args);
		}
		else {
			return o[prop];
		}
	};
	derived.gain = function(prop, val){
		if (!isStr(prop)) {
			throw new Error('The first argument of cloz.gain() must be string.');
		}
		if (typeof o[prop] === 'undefined') {
			if (base.hasOwnProperty('get')) {
				return base.gain.apply(this, arguments);
			}
			else {
				val = val || null;
				return val;
			}
		}
		else if (typeof o[prop] === 'function') {
			var args = [];
			for (var i = 2; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
			return o[prop].apply(this, args);
		}
		else {
			return o[prop];
		}
	};
	derived.getAll = function(){
		return o;
	};
	derived.set = function(prop, val){
		if (isStr(prop)) {
			o[prop] = val;
			return o[prop];
		}
		if (isObj(prop)) {
			for (var p in prop) {
				o[p] = prop[p];
			}
			return prop;
		}
		throw new Error('The first argument of cloz.set() must be string or object.');
	};
	derived.extend = function(prop, obj){
		if (!isStr(prop)) {
			throw new Error('The first argument of cloz.extend() must be string.');
		}
		o[prop] = cloz(this.get(prop), obj);
		return o[prop];
	};

	if (typeof ex === 'object' && ex !== null) {
		for (var p in ex) {
			derived.set(p, ex[p]);
		}
		if (ex.hasOwnProperty('__cloz')) {
			ex.__cloz();
		}
		if (ex.hasOwnProperty('_cloz')) {
			ex._cloz();
		}
		else {
			derived.gain('_cloz');
		}
	}
	else {
		derived.gain('_cloz');
	}

	return derived;
};
