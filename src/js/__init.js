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
