ZERO_OFFSET = 150;
WIDTH = 600;
HEIGHT = 650;

LEFT_MARGIN = 150;
RIGHT_MARGIN = 150;
TOP_MARGIN = 50;
BOTTOM_MARGIN = 50;

Y1 = 2015;
Y2 = 2016;

ELIGIBLE_SIZE = HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

var dataset = {};
var diffDataset = {};

var diffPlot = true;

var leftGroup, rightGroup;

var min, max, minD, maxD, minR, maxR;
var _, _y;
var sg, leftGroup, rightGroup, allLines;


var plotTitle = "Time comparison"
//HEIGHT = max + TOP_MARGIN + BOTTOM_MARGIN


function y(d,i){
	return HEIGHT - _y(d)
}

function yDiffLabel(d,i){
    return HEIGHT - _yDiffLabel(d)
}

function yDiffValue(d,i){
    return HEIGHT - _yDiffValue(d)
}

function yRatioLabel(d,i){
    return HEIGHT - _yRatioLabel(d)
}

function yRatioValue(d,i){
    return HEIGHT - _yRatioValue(d)
}



var convertToTime = function (csvData){
	var time = {};
	for(var i=0; i<csvData.length; i++){
		var item = csvData[i];
		var n = item.Name;
		var m = +item.Min;
		var s = +item.Sec;
		time[n] = m*60+s;
	};
	return time;
}

var deferred2015 = new $.Deferred();
d3.csv("/extras/run10k-2015.csv", function(csvData) {
	dataset["2015"] = convertToTime(csvData);
	deferred2015.resolve();
});

var deferred2016 = new $.Deferred();
d3.csv("/extras/run10k-2016.csv", function(csvData) {
	dataset["2016"] = convertToTime(csvData);
	deferred2016.resolve();
});


$.when(deferred2015, deferred2016).done(function(){

	console.log("Here.");
	console.log(dataset);
	var d1 = dataset["2015"];
	var d2 = dataset["2016"];
	var lD={}, rD={};
	diffDataset["2015"] = {};
	diffDataset["2016"] = {};
	for(var person in d1){
		if(d1[person] && d2[person]){
			diffDataset["2015"][person] = d1[person];
			diffDataset["2016"][person] = d2[person];
		} else {
			if(d1[person]){
				lD[person] = d1[person];
			} else{
				rD[person] = d2[person]; 
			}
		}
			
	}
	console.log('left: ' + lD);
	console.log('right: ' + rD);
	
	// createPlot(diffDataset);
	createPlot(dataset);

});

var moveRatio = function (){

	leftGroup.selectAll('text')
		.transition()
		.attr('y', function(d,i){
			return TOP_MARGIN;
		})
		;
	
	leftGroup.selectAll("text")
		.text('');
	
	rightGroup.selectAll('text')
		.transition()
			.attr('y', function(d,i){
				return yRatioLabel(d.ratio_coord);
			});
    
    rightGroupValues.selectAll('text')
        .transition()
			.attr('y', function(d,i){
				return yRatioLabel(d.ratio_coord);
			})
			.text(function(d,i){
                return d.ratio+'\%'
            })
			;

	allLines.selectAll('line')
			.transition()
			.attr('y1', function(d,i){
				return yRatioValue(1);
			})
			.attr('y2', function(d,i){
				return yRatioLabel(d.ratio_coord);
			})
			;

}

var moveDiff = function (){

	leftGroup.selectAll('text')
		.transition()
		.attr('y', function(d,i){
			return TOP_MARGIN;
		})
		;
	
	leftGroup.selectAll("text")
		.text('');
	
	rightGroup.selectAll('text')
		.transition()
			.attr('y', function(d,i){
				return yDiffLabel(d.diff_coord);
			});
    
    rightGroupValues.selectAll('text')
        .transition()
			.attr('y', function(d,i){
				return yDiffLabel(d.diff_coord);
			})
			.text(function(d,i){
                var dt = Math.abs(d.right-d.left);
                var min = Math.floor(dt/60)
                var sec = dt%60
                var pm = d.right>d.left?'+':'-';
                return pm+(min<10?"0"+min:min)+":"+(sec<10?"0"+sec:sec)})
			;

	allLines.selectAll('line')
			.transition()
			.attr('y1', function(d,i){
				return yDiffValue(0);
			})
			.attr('y2', function(d,i){
				return yDiffLabel(d.diff_coord);
			})
			;

}

var moveNormal = function (){

	leftGroup.selectAll('text')
		.transition()
		.attr('y', function(d,i){
			return y(d.left_coord)
		})
		;
		
	leftGroupLabels.selectAll("text")
		.text(function(d,i){ return d.label});
	leftGroupValues.selectAll("text")
        .text(function(d,i){ 
            var sec = d.left%60;
            return Math.floor(d.left/60) +":"+(sec<10?"0"+sec:sec)
            })
		
	rightGroup.selectAll('text')
		.transition()
			.attr('y', function(d,i){
				return y(d.right_coord)
			})
			;
    
    rightGroupValues.selectAll('text')
        .transition()
			.attr('y', function(d,i){
				return y(d.right_coord);
			})
			.text(function(d,i){ 
                var sec = d.right%60;
                return Math.floor(d.right/60) +":"+(sec<10?"0"+sec:sec)
                })
			
	allLines.selectAll('line')
			.transition()
			.attr('y1', function(d,i){
				return y(d.left_coord)
			})
			.attr('y2', function(d,i){
				return y(d.right_coord)
			})
			;

}

var createPlot = function (_data) {

	sg = d3.select('#slopegraph')
		.append('svg')
		.attr('width', WIDTH)
		.attr('height', HEIGHT);



	var data = _to_data("2015", "2016", _data);
	
	function _to_data(y1,y2,d){
		var y1d = d[y1];
		var y2d = d[y2];
		var _d = {};
		for (var k1 in y1d) {
            if (y2d.hasOwnProperty(k1)) {
                l = y1d[k1]; r = y2d[k1];
			_d[k1] = {};
			_d[k1]['left'] = y1d[k1];
			_d[k1]['right'] = y2d[k1];
            _d[k1]['diff'] = y2d[k1] - y1d[k1];
            _d[k1]['ratio'] = Math.round(10000*(r-l)/l)/100;
                
			_d[k1]['label'] = k1;
            }
		}
        d = [];
		var di;
		for (var k in _d){
			di = _d[k];
			d.push(di)
		}
		return d;

		return _d;
	}

	function _max_key(v){
		var vi, max_side;
		var _m = undefined;
		for (var i = 0; i < v.length; i += 1){
			vi = v[i];
			max_side = Math.max(vi.left, vi.right)
			if (_m == undefined || max_side > _m) {
				_m = max_side;
			}
		}
		return _m;
	}

	function _min_key(v){
		var vi, min_side;
		var _m = undefined;
		for (var i = 0; i < v.length; i += 1){
			vi = v[i];
			min_side = Math.min(vi.left, vi.right)
			if (_m == undefined || min_side < _m) {
				_m = min_side;
			}
		}
		return _m;
	}
    
	function _min_key_diff(v){
		var _m = v[0].diff;
		for (var i = 1; i < v.length; i += 1){
			if(v[i].diff<_m) {
				_m = v[i].diff;
			}
		}
		return _m;
	}
    
	function _max_key_diff(v){
        var _m = v[0].diff;
		for (var i = 1; i < v.length; i += 1){
			if(v[i].diff>_m){
                _m = v[i].diff;
            }
		}
		return _m;
	}
 
    function _min_key_ratio(v){
		var _m = v[0].ratio;
		for (var i = 1; i < v.length; i += 1){
			if(v[i].ratio<_m) {
				_m = v[i].ratio;
			}
		}
		return _m;
	}
    
	function _max_key_ratio(v){
        var _m = v[0].ratio;
		for (var i = 1; i < v.length; i += 1){
			if(v[i].ratio>_m){
                _m = v[i].ratio;
            }
		}
		return _m;
	}
    
	function _min_max(v){
		var vi, min_side, max_side;
		var _max = undefined;
		var _min = undefined;


		for (var i = 0; i < v.length; i += 1){
			vi = v[i];
			min_side = Math.min(vi.left_coord, vi.right_coord);
			max_side = Math.max(vi.left_coord, vi.right_coord);

			if (_min == undefined || min_side < _min) {
				_min = min_side;
			}
			if (_max == undefined || max_side > _max) {
				_max = max_side;
			}


		}
		return [_min, _max];
	}
    
	function _min_max_diff(v){
		var _max = v[0].diff_coord;
		var _min = v[0].diff_coord;


		for (var i = 0; i < v.length; i += 1){
            var dC = v[i].diff_coord;
            if(dC < _min){
                _min = dC;
            } else
            if(dC > _max) {
                _max = dC;
            }

		}
		return [_min, _max];
	}
    
	function _min_max_ratio(v){
		var _max = v[0].ratio_coord;
		var _min = v[0].ratio_coord;

		for (var i = 0; i < v.length; i += 1){
            var dC = v[i].ratio_coord;
            if(dC < _min){
                _min = dC;
            } else
            if(dC > _max) {
                _max = dC;
            }

		}
		return [_min, _max];
	}
    
	_y = d3.scale.linear()
				.domain([_min_key(data), _max_key(data)])
				.range([TOP_MARGIN, HEIGHT-BOTTOM_MARGIN])

    _yDiffValue = d3.scale.linear()
            .domain([_max_key_diff(data), _min_key_diff(data)])
            .range([TOP_MARGIN, HEIGHT-BOTTOM_MARGIN])

   
    _yRatioValue = d3.scale.linear()
            .domain([_max_key_ratio(data), _min_key_ratio(data)])
            .range([TOP_MARGIN, HEIGHT-BOTTOM_MARGIN])
 
	//
	for (var i = 0; i < data.length; i += 1){
		data[i].left_coord = y(data[i].left);
		data[i].right_coord = y(data[i].right);
        data[i].diff_coord = yDiffValue(data[i].diff);
        data[i].ratio_coord = yRatioValue(data[i].ratio);
	}


	function _slopegraph_preprocess(d){
		// computes y coords for each data point
		// create two separate object arrays for each side, then order them together, and THEN run the shifting alg.

		var offset;

		var font_size = 15;
		var l = d.length;

		var max = _max_key(d);
		var min = _min_key(d);
		var range = max-min;
        
        var maxDiff = _max_key_diff(d);
        var minDiff = _min_key_diff(d);
        var rangeDiff = maxDiff-minDiff;

		//
		var left = [], right = [], diff = [], ratio = [];

		for (var i = 0; i < d.length; i += 1) {
			di = d[i];
			left.push({label:di.label, value:di.left, side:'left', coord:di.left_coord})
			right.push({label:di.label, value:di.right, side:'right', coord: di.right_coord})
            diff.push({label:di.label, value:di.diff, coord: di.diff_coord})
            ratio.push({label:di.label, value:di.ratio, coord: di.ratio_coord})
		}

		var both = left.concat(right)
		both.sort(function(a,b){
			if (a.value > b.value){
				return 1
			} else if (a.value < b.value) {
				return -1
			} else { 
				if (a.label > b.label) {
					return 1
				} else if (a.lable < b.label) {
					return -1
				} else {
					return 0
				}
			}
		}).reverse()
        
        diff.sort(function(a,b){
			if (a.value > b.value){
				return 1
			} else if (a.value < b.value) {
				return -1
			} else { 
				if (a.label > b.label) {
					return 1
				} else if (a.lable < b.label) {
					return -1
				} else {
					return 0
				}
			}
		})
        
        ratio.sort(function(a,b){
			if (a.value > b.value){
				return 1
			} else if (a.value < b.value) {
				return -1
			} else { 
				if (a.label > b.label) {
					return 1
				} else if (a.lable < b.label) {
					return -1
				} else {
					return 0
				}
			}
		})
        
		var new_data = {};
		var side, label, val, coord;
		for (var i = 0; i < both.length; i += 1) {

			label = both[i].label;
			side = both[i].side;
			val = both[i].value;
			coord = both[i].coord;

			if (!new_data.hasOwnProperty(both[i].label)) {
				new_data[label] = {}
			}
			new_data[label][side] = val;

			if (i > 0) {
				if (coord - font_size < both[i-1].coord || 
					!(val === both[i-1].value && side != both[i-1].side)) {
									
					new_data[label][side + '_coord'] = coord + font_size;

					for (j = i; j < both.length; j += 1) {
						both[j].coord = both[j].coord + font_size;
					}
				} else {
					new_data[label][side + '_coord'] = coord;
				}

				if (val === both[i-1].value && side !== both[i-1].side) {
					new_data[label][side + '_coord'] = both[i-1].coord;
				}
		} else {
			new_data[label][side + '_coord'] = coord;
		}

		}
        
        var diffCoord;
		for (var i = 0; i < diff.length; i += 1) {
            
            label = diff[i].label;
            diffCoord = diff[i].coord;
            
            new_data[label]['diff'] = diff[i].value;
            new_data[label]['diff_coord'] = diffCoord;
            

            if(i>0){
                if(diffCoord - font_size < diff[i-1].coord )
                    
                    new_data[label]['diff_coord'] = diffCoord + font_size;
                    for (j = i; j < diff.length; j += 1) {
						diff[j].coord = diff[j].coord + font_size;
					}
            }
        }

        var ratioCoord;
		for (var i = 0; i < ratio.length; i += 1) {
            
            label = ratio[i].label;
            ratioCoord = ratio[i].coord;
            
            new_data[label]['ratio'] = ratio[i].value;
            new_data[label]['ratio_coord'] = ratioCoord;
            

            if(i>0){
                if(ratioCoord - font_size < ratio[i-1].coord )
                    
                    new_data[label]['ratio_coord'] = ratioCoord + font_size;
                    for (j = i; j < ratio.length; j += 1) {
						ratio[j].coord = ratio[j].coord + font_size;
					}
            }
        }
        
		d = [];
		for (var label in new_data){	
			val = new_data[label];
			val.label = label;
			d.push(val)
		}

		return d;
	}



	data = _slopegraph_preprocess(data)
	_ = _min_max(data)
	min = _[0]
	max = _[1]
    
    _ = _min_max_diff(data);
    minD = _[0];
    maxD = _[1];

    _ = _min_max_ratio(data);
    minR = _[0];
    maxR = _[1];

	//HEIGHT = max + TOP_MARGIN + BOTTOM_MARGIN


	_y = d3.scale.linear()
		.domain([min, max])
		.range([TOP_MARGIN, HEIGHT-BOTTOM_MARGIN])

    _yDiffLabel = d3.scale.linear()
        .domain([maxD, minD])
        .range([TOP_MARGIN, HEIGHT-BOTTOM_MARGIN])

    _yRatioLabel = d3.scale.linear()
        .domain([maxR, minR])
        .range([TOP_MARGIN, HEIGHT-BOTTOM_MARGIN])
    
	leftGroup = sg.append("g");
	leftGroupLabels = leftGroup.append("g");
	leftGroupValues = leftGroup.append("g");
	rightGroup = sg.append("g");
    rightGroupLabels = rightGroup.append("g");
    rightGroupValues = rightGroup.append("g");
	allLines = sg.append("g");
	
	leftGroupLabels.selectAll('.left_labels')
		.data(data).enter().append('svg:text')
			.attr('x', LEFT_MARGIN-50)
			.attr('y', function(d,i){
				return y(d.left_coord)
			})
			.attr('dy', '.45em')
			.attr('font-weight', 'bold')
			.attr('text-anchor', 'end')
			.text(function(d,i){ return d.label})
			// .attr('fill', 'black')
			.attr('fill', function(d,i){
				if(d.right==0) return 'red';
				else return 'black';
				})

	leftGroupValues.selectAll('.left_values').append('left_values')
		.data(data).enter().append('svg:text')
			.attr('x', LEFT_MARGIN-10)
			.attr('y', function(d,i){
				return y(d.left_coord)
			})
			.attr('dy', '.45em')
			.attr('text-anchor', 'end')
			.text(function(d,i){ 
                var sec = d.left%60;
                return Math.floor(d.left/60) +":"+(sec<10?"0"+sec:sec)})
			.attr('fill', 'black')

	rightGroupLabels.selectAll('.right_labels')
		.data(data).enter().append('svg:text')
			.attr('x', WIDTH-RIGHT_MARGIN)
			.attr('y', function(d,i){
				return y(d.right_coord)
			})
			.attr('dy', '.35em')
			.attr('dx', 60)
			.attr('font-weight', 'bold')
			.text(function(d,i){ return d.label})
			.attr('fill', function(d){if(d.left==0) return 'blue'; else return 'black';})

	//
	rightGroupValues.selectAll('.right_values')
		.data(data).enter().append('svg:text')
			.attr('x', WIDTH-RIGHT_MARGIN)
			.attr('y', function(d,i){
				return y(d.right_coord)
			})
			.attr('dy', '.35em')
			.attr('dx', 5)
			.text(function(d,i){ 
                var sec = d.right%60;
                return Math.floor(d.right/60) +":"+(sec<10?"0"+sec:sec);
                })
			.attr('fill', 'black')

	sg.append('svg:text')
		.attr('x', LEFT_MARGIN)
		.attr('y', TOP_MARGIN/2)
		.attr('text-anchor', 'end')
		.attr('opacity', .5)
		.text(Y1)

	//
	sg.append('svg:text')
		.attr('x', WIDTH-RIGHT_MARGIN)
		.attr('y', TOP_MARGIN/2)
		.attr('opacity', .5)
		.text(Y2)

	sg.append('svg:line')
		.attr('x1', LEFT_MARGIN/2)
		.attr('x2', WIDTH-RIGHT_MARGIN/2)
		.attr('y1', TOP_MARGIN*2/3)
		.attr('y2', TOP_MARGIN*2/3)
		.attr('stroke', 'black')
		.attr('opacity', .5)

	sg.append('svg:text')
		.attr('x', WIDTH/2)
		.attr('y', TOP_MARGIN/2)
		.attr('text-anchor', 'middle')
		.text(plotTitle)
		.attr('font-variant', 'small-caps')

	allLines.selectAll('.slopes')
		.data(data).enter().append('svg:line')
			.attr('x1', LEFT_MARGIN)
			.attr('x2', WIDTH-RIGHT_MARGIN)
			.attr('y1', function(d,i){
				return y(d.left_coord);
			})
			.attr('y2', function(d,i){
				return y(d.right_coord);
			})
			.attr('opacity', .6)
			.attr('stroke', 'black')

	
}
