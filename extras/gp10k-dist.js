var year = "2016";
var plotDist, layersVal, rectAll;
var yearCmb = d3.select('#distYearCmb');
d3.select('#distYearCmb')
  .on('change', function() {
    year = d3.select(this).property('value');
    changeYear(year);
    }
  );

var margin = {top: 40, right: 10, bottom: 20, left: 10},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var transitionGrouped;
var transitionStacked;

var yScale, yGroupMax, yStackMax;

var std = 0.5;

plotDist = function(year){
    
    var data = totalData[year];
    var lM = data.filter(function(d){ return d.Sex=='M';});
    var lF = data.filter(function(d){ return d.Sex=='F';});

    var lMv = [], lFv = [];
    for(var i=0; i<lM.length; ++i){
        var m = +lM[i].Min;
        var s = +lM[i].Sec;
        lMv.push(m*60+s)
    }
    for(var i=0; i<lF.length; ++i){
        var m = +lF[i].Min;
        var s = +lF[i].Sec;
        lFv.push(m*60+s)
    }
    var minY, maxY;
    var dataY = dataset[year];
    for(var d in dataY){
        if(!minY) minY = dataY[d];
        if(!maxY) maxY = dataY[d];
            
        if(dataY[d]<minY){ minY = dataY[d];} else
        if(dataY[d]>maxY){ maxY = dataY[d];}
    }
    
    var kde = function(x, x0, std){
        return Math.exp( -(0.25*Math.pow((x-x0)/std,2) ) );
    }
    
    var tArr = d3.range(Math.round(minY/60)-5, Math.round(maxY/60)+5, 1);
    
    var kdeM=[], kdeF=[];
    var totalS=0;
    tArr.forEach(function(t){
        var s=0;
        lFv.forEach(function(v){
            s += kde(t, v/60, std);
        })
        kdeF.push({x: t, y: s});
        totalS += s
        
        s=0;
        lMv.forEach(function(v){
            s += kde(t, v/60, std);
        });
        kdeM.push({x: t, y: s});
        totalS += s;
    });
    
    kdeF.forEach(function(d){d.y = d.y/totalS;});
    kdeM.forEach(function(d){d.y = d.y/totalS;});

    var n = 2; // number of layers
//        m = 58; // number of samples per layer
    var stack = d3.layout.stack();
    
//    var layers = stack(d3.range(n).map(function() { return bumpLayer(m, .1); }));
    layersVal = stack([kdeM, kdeF]);
    yGroupMax = d3.max(layersVal, function(layer) { return d3.max(layer, function(d) { return d.y; }); });
    yStackMax = d3.max(layersVal, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

    var x = d3.scale.ordinal()
//        .domain(d3.range(tArr.length))
        .domain(tArr)
        .rangeRoundBands([0, width], .08);

    yScale = d3.scale.linear()
        .domain([0, yStackMax])
        .range([height, 0]);
    
    var color = d3.scale.linear()
        .domain([0, n - 1])
        .range(["#aad", "#FFC0CB"]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(0)
        .tickPadding(6)
        .orient("bottom");

    var svg = d3.select("#annualKDE").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    layer = svg.selectAll(".layer")
        .data(layersVal)
      .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d, i) { return color(i); });

    rectAll = layer.selectAll("rect")
        .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", height)
        .attr("width", x.rangeBand())
        .attr("height", 0);

    rectAll.transition()
        .delay(function(d, i) { return i * 10; })
        .attr("y", function(d) { return yScale(d.y0 + d.y); })
        .attr("height", function(d) { return yScale(d.y0) - yScale(d.y0 + d.y); });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    d3.selectAll("input").on("change", change);

    var timeout = setTimeout(function() {
      d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
    }, 100);

    function change() {
      clearTimeout(timeout);
      if (this.value === "grouped") transitionGrouped();
      else transitionStacked();
    }

    transitionGrouped = function () {
      yScale.domain([0, yGroupMax]);

      rectAll.transition()
          .duration(500)
          .delay(function(d, i) { return i * 10; })
          .attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / n * j; })
          .attr("width", x.rangeBand() / n)
        .transition()
          .attr("y", function(d) { return yScale(d.y); })
          .attr("height", function(d) { return height - yScale(d.y); });
    }

    transitionStacked = function () {
      yScale.domain([0, yStackMax]);

      rectAll.transition()
          .duration(500)
          .delay(function(d, i) { return i * 10; })
          .attr("y", function(d) { return yScale(d.y0 + d.y); })
          .attr("height", function(d) { return yScale(d.y0) - yScale(d.y0 + d.y); })
        .transition()
          .attr("x", function(d) { return x(d.x); })
          .attr("width", x.rangeBand());
    }
}

var changeYear = function(year){
    console.log("Selected year: " + year);
    var data = totalData[year];
    var lM = data.filter(function(d){ return d.Sex=='M';});
    var lF = data.filter(function(d){ return d.Sex=='F';});

    var lMv = [], lFv = [];
    for(var i=0; i<lM.length; ++i){
        var m = +lM[i].Min;
        var s = +lM[i].Sec;
        lMv.push(m*60+s)
    }
    for(var i=0; i<lF.length; ++i){
        var m = +lF[i].Min;
        var s = +lF[i].Sec;
        lFv.push(m*60+s)
    }
    var minY, maxY;
    var dataY = dataset[year];
    for(var d in dataY){
        if(!minY) minY = dataY[d];
        if(!maxY) maxY = dataY[d];
            
        if(dataY[d]<minY){ minY = dataY[d];} else
        if(dataY[d]>maxY){ maxY = dataY[d];}
    }
    
    var kde = function(x, x0, std){
        return Math.exp( -(0.25*Math.pow((x-x0)/std,2) ) );
    }
    
    var tArr = d3.range(Math.round(minY/60)-5, Math.round(maxY/60)+5, 1);
    
    var kdeM=[], kdeF=[];
    var totalS=0;
    tArr.forEach(function(t){
        var s=0;
        lFv.forEach(function(v){
            s += kde(t, v/60, 1);
        })
        kdeF.push({x: t, y: s});
        totalS += s
        
        s=0;
        lMv.forEach(function(v){
            s += kde(t, v/60, 1);
        });
        kdeM.push({x: t, y: s});
        totalS += s;
    });
    
    kdeF.forEach(function(d){d.y = d.y/totalS;});
    kdeM.forEach(function(d){d.y = d.y/totalS;});
    

    var n = 2; // number of layers
    var stack = d3.layout.stack();
    
    layersVal = stack([kdeM, kdeF]);
    yGroupMax = d3.max(layersVal, function(layer) { return d3.max(layer, function(d) { return d.y; }); });
    yStackMax = d3.max(layersVal, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

    yScale.domain([0, yStackMax])
    
    
    layer = d3.selectAll(".layer")
        .data(layersVal);
//      .enter().append("g")
//        .attr("class", "layer")
//        .style("fill", function(d, i) { return color(i); });

    rectAll = layer.selectAll("rect")
        .data(function(d) { return d; });
        
    if(d3.select("input[value=\"grouped\"]").property("checked")){
        transitionGrouped();
    } else {
        transitionStacked();   
    }
}

// Wait until data are loaded
$.when(allDeferred).done(function(){
  plotDist(year);
});
