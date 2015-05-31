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
	lap: function(){
		return this.logger.get('lap', this.logger.get('head').get('x'), this.logger.get('head').get('y'));
	},
	round: function(bool){
		bool = arguments.length === 0 ? true : bool;
		return this.logger.get('round', bool);
	},
	progress: function(decelerate){
		decelerate = arguments.length === 0 ? true : decelerate;
		if (decelerate === true) {
			var sum = 0;
			this.logger.get('log').forEach(function(v, i){
				sum += v.density;
			});
			return sum / (this.logger.get('volume'));
		}
		return this.get('index') / (this.logger.get('space') - 1);
	},
	stage: function(){
		var last_opponent = null, last_self = null;
		if (this.logger.get('head').get('index') !== 0) {
			var last_log = this.logger.get('log')[this.logger.get('head').get('index')-1];
			last_opponent = this.logger.get('elements')[last_log.x];
			last_self = this.logger.get('elements')[last_log.y];
		}
		return {
			opponent: this.logger.get('opponent'), // 相手
			self: this.logger.get('self'), // 自分
			// 相手→自分、または、自分→相手の移動が起こったか
			change: this.logger.get('self') === last_opponent || this.logger.get('opponent') === last_self,
		};
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
