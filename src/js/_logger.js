(function(){
'use strict';

manu.api.logger = cloz(manu.base, {
	settings: {
		name: 'manusort',
		randomize: false,
	},

	// 情報取得
	// 周回index
	lap: function(x, y){
		return x - y -1;
	},
	// 終了した試合数（引数がfalseの場合は現在の試合番号）
	round: function(bool){
		return this.get('log').filter(function(v){
			return v.type !== 'auto';
		}).length + (bool ? 0 : 1);
	},
	// 相手
	opponent: function(index){
		index = index || null;
		if (index === null) {
			return this.get('elements')[this.get('head').get('x')];
		}
	},
	// 自分
	self: function(index){
		index = index || null;
		if (index === null) {
			return this.get('elements')[this.get('head').get('y')];
		}
	},
	// 現在のステージ
	present: function(){
		var last_opponent = null, last_self = null;
		if (this.get('head').get('index') !== 0) {
			var last = this.get('last');
			last_opponent = this.get('elements')[last.x];
			last_self = this.get('elements')[last.y];
		}
		return {
			opponent: this.get('opponent'), // 相手
			self: this.get('self'), // 自分
			// 相手→自分、または、自分→相手の移動が起こり、かつ直前で入れ替わっていなければtrue
			change: (this.get('self') === last_opponent || this.get('opponent') === last_self) && this.get('last').change === false,
		};
	},
	// 直前のstageのログ（autoを含めない）
	last: function(){
		return this.get('log').filter(function(v){
			return v.type !== 'auto';
		}).pop();
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
	// 3次元サイズ
	volume: function(){
		var l = this.get('length');
		return Math.pow(2, l - 1) * (l - 2) + 1;
	},
	density: function(x, y){
		return Math.pow(2, this.get('length') - this.get('lap', x, y) - 2);
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
		obj.density = this.get('density', obj.x, obj.y);
		obj.change = this.get('present').change;


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