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

var manu = {api:{},base:{}};

var Manusort = function(elements, settings) {

	// user settings
	settings = settings || {};

	// initialization
	var _this = Object.create(manu.manager);
	_this.logger = cloz(manu.api.logger, {
		elements: elements.map(function(v){
			v.dropped = 0;
			return v;
		}),
		head: cloz({}, {
			index: 0,
			x: 1, // opponent
			y: 0, // self
		}),
		log: [],
		grid: null,
	});

	var a = Array.apply(null, new Array(_this.logger.get('length')));

	_this.logger.extend('settings', settings);
	_this.logger.set('grid', a.map(function(v){ return []; }));

	return _this;
};

(function(){
'use strict';

manu.getLength = function(){
	return this.logger.get('length');
};

})();

(function(){
'use strict';

manu.judge = cloz(manu.base, {
	judge: function(x, y, grid, elements){
		var sum = 0;
		// 両者すでにdropしていたら
		if (elements[x].dropped === 1 && elements[y].dropped === 1) {
			return null;
		}
		// 相手がすでにdropしていたら
		if (elements[x].dropped === 1) {
			return 1;
		}
		// 自分がすでにdropしていたら
		if (elements[y].dropped === 1) {
			return -1;
		}
		for (var i = 1; i < x - y; i++) {
			// dropされているものはカウントしない
			var score_y = elements[x-i].dropped === 0 ? grid[x-i][y].score : 0;
			var score_x = elements[y+i].dropped === 0 ? grid[x][y+i].score : 0;
			sum += score_y + score_x;
		}
		// console.log('sum=' + sum + ' (' + x + ',' + y + ')');
		return sum;
	},
	result: function(log, elements){
		var sum = 0;
		var len = elements.length;
		var a = [], arr = [];
		var res;

		for (var i=0; i<len; i++) {
			a.push(0);
		}

		log.forEach(function(v, i){
			// dropされているものはカウントしない
			if (elements[v.x].dropped === 0 && elements[v.y].dropped === 0) {
				a[v.x] -= v.score; // 相手
				a[v.y] += v.score; // 自分
			}
		});

		a.forEach(function(v, i){
			arr.push({
				index: i,
				score: v,
			});
		});

		// 点数順にソート
		arr = arr.sort(function(p, q){
			return q.score - p.score;
		});

		res = this.get('_format', arr, elements);

		return res;
	},
	_format: function(arr, elements){
		var rank = 1;
		var prev = null;
		var a = [[]];

		arr = arr.filter(function(v,i){
			var elem = elements[v.index];
			if (elem.dropped === 1) {
				a[0].push(elem);
				return false;
			}
			return true;
		});

		for (var i=0; i<arr.length; i++) {
			var elem = elements[arr[i].index];
			if (prev !== arr[i].score) {
				rank = i+1;
				a[rank] = [];
			}

			a[rank].push(elem);
			prev = arr[i].score;
		}

		return a;
	},
});

})();

(function(){
'use strict';

manu.api.logger = cloz(manu.base, {
	settings: {
		name: 'manusort',
		randomize: false,
	},

	// 情報取得
	// 周回index
	lap: function(index){
		/* in draft */
	},
	// 終了した試合数（引数がfalseの場合は現在の試合番号）
	round: function(bool){
		return this.get('log').filter(function(v){
			return v.type !== 'auto';
		}).length + (bool ? 0 : 1);
	},
	// 自分自身
	self: function(index){
		index = index || null;
		if (index === null) {
			return this.get('elements')[this.get('head').get('y')];
		}
	},
	// 対戦者
	opponent: function(index){
		index = index || null;
		if (index === null) {
			return this.get('elements')[this.get('head').get('x')];
		}
	},
	// 1次元サイズ
	length: function(){
		return this.get('elements').length;
	},
	// 2次元サイズ
	space: function(){
		var l = this.get('length');
		return (l - 1) * l / 2;
	},
	cell: function(x, y, v){
		if (arguments.length < 2) { v = null; }
		if (v === null) {
			return this.get('grid')[x][y];
		}
		this.get('grid')[x][y] = v;
		return v;
	},

	write: function(obj){
		obj.index = this.get('head').get('index');
		obj.x = this.get('head').get('x');
		obj.y = this.get('head').get('y');


		// drop処理
		if (obj.type === 'drop') {
			// 判定が0または1なら相手(x)を落とす
			if (obj.score > -1) {
				this.get('elements')[obj.x].dropped = 1;
			}
			// 判定が0または-1なら自分(y)を落とす
			if (obj.score < 1) {
				this.get('elements')[obj.y].dropped = 1;
			}
		}

		var log = this.get('cell', obj.x, obj.y, obj);
		return this.get('log').push(log);
	},
	next: function(){
		var i = this.get('head').get('index');
		var x = this.get('head').get('x');
		var y = this.get('head').get('y');
		var l = this.get('length');

		// indexが最後まで達したら終了
		if (i + 1 === this.get('space')) {
			return false;
		}

		this.get('head').set('index', i + 1);

		// xが最後まで達したら次のlap
		if (x + 1 === l) {
			this.get('head').set({
				x: l - y,
				y: 0,
			});
		}
		else {
			this.get('head').set({
				x: x + 1,
				y: y + 1,
			});
		}

		return true;
	},
	rollback: function(index){
		if (this.get('head').get('index') === 0) {
			return false;
		}
		var p = this.get('log').pop();
		if (p.type === 'auto') {
			this.get('rollback');
		}
		else {
			this.get('head').set({
				index: p.index,
				x: p.x,
				y: p.y,
			});
			this.get('elements')[p.x].dropped = 0;
			this.get('elements')[p.y].dropped = 0;
		}
		return true;
	},
	info: function(){
		return {
			head: this.get('head').getAll(),
			stage: [this.get('opponent'), this.get('self')],
			log: this.get('log'),
			grid: this.get('grid'),
			settings: this.get('settings').getAll(),
			elements: this.get('elements'),
			length: this.get('length'),
			space: this.get('space'),
		};
	}
});

})();
/*jshint -W018 */
(function(){
'use strict';

manu.manager = cloz(manu.base, {
	elements: function(){
		return this.logger.get('elements');
	},
	log: function(){
		return this.logger.get('log');
	},
	index: function(){
		return this.logger.get('head').get('index');
	},
	round: function(bool){
		bool = arguments.length === 0 ? true : bool;
		return this.logger.get('round', bool);
	},
	progress: function(){
		return this.get('index') / (this.logger.get('space') - 1);
	},
	stage: function(){
		return [
			this.logger.get('opponent'),
			this.logger.get('self'),
		];
	},
	judge: function(outcome, bool){
		var args = arguments.length;
		// 勝ちまたは負け
		if (outcome === 'win' || outcome === 'lose') {
			if (args < 2) { bool = 1; }
			this.logger.get('write', {
				type: 'win',
				score: (outcome === 'win') === !!bool ? 1 : -1,
			});
		}
		// 引き分け
		else if (outcome === 'draw') {
			this.logger.get('write', {
				type: outcome,
				score: 0,
			});
		}
		// 退場
		else if (outcome === 'drop') {
			if (args < 2) { bool = null; }
			// 両者退場
			if (bool === null) {
				this.logger.get('write', {
					type: outcome,
					score: 0,
				});
				this.logger.get('elements')[this.logger.get('head').get('x')].dropped = 1;
				this.logger.get('elements')[this.logger.get('head').get('y')].dropped = 1;
			}
			else {
				this.logger.get('write', {
					type: outcome,
					score: bool ? -1 : 1,
				});
			}
		}
		else {
			throw new Error('The first argument of "judge" must be "win", "lose", "draw" or "drop".');
		}

		return this.get('_next');
	},
	back: function(){
		return this.logger.get('rollback');
	},
	result: function(){
		return manu.judge.get('result', this.logger.get('log'), this.logger.get('elements'));
	},
	// 保存されたコマンドを流し込む
	inject: function(){/* coming soon */},
	info: function(){
		return this.logger.get('info');
	},
	_next: function(){

		// 次がなければ終了
		if (!this.logger.get('next')) {
			console.log('end');
			return false;
		}

		var sum = this.get('_auto');

		// 自動判定
		if (sum === null) {
			this.logger.get('write', {
				type: 'auto',
				score: 0,
			});
			return this.get('_next');
		}
		else if (sum !== 0) {
			this.logger.get('write', {
				type: 'auto',
				score: sum / Math.abs(sum),
			});
			return this.get('_next');
		}

		return true;
	},
	_auto: function(){
		return manu.judge.get('judge', this.logger.get('head').get('x'), this.logger.get('head').get('y'), this.logger.get('grid'), this.logger.get('elements'));
	},
});

})();
