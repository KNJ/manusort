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
